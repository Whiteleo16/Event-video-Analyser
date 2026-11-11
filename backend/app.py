from __future__ import annotations

import io
import logging
import uuid
from collections import Counter
from datetime import datetime
from pathlib import Path

import cv2
import numpy as np
from flask import Flask, jsonify, request, send_file, send_from_directory
from flask_cors import CORS
from sklearn.neural_network import MLPClassifier
from werkzeug.utils import secure_filename

try:
    from ultralytics import YOLO
except Exception:  # pragma: no cover
    YOLO = None

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "uploads"
GENERATED_DIR = BASE_DIR / "generated"
UPLOAD_DIR.mkdir(exist_ok=True)
GENERATED_DIR.mkdir(exist_ok=True)

logging.basicConfig(level=logging.INFO)

REPORTS: list[dict] = []


class EventPipeline:
    EVENT_LABELS = [
        "presentation",
        "speech",
        "panel discussion",
        "dance performance",
        "singing performance",
        "prize distribution",
        "cultural programme",
        "unknown",
    ]

    def __init__(self):
        self.model = self._build_model()
        self.yolo_model = self._load_yolo_model()

    def _load_yolo_model(self):
        if YOLO is None:
            logging.warning("Ultralytics is unavailable; using heuristic classification only.")
            return None
        try:
            return YOLO("yolov8n.pt")
        except Exception as exc:  # pragma: no cover
            logging.warning("YOLO model could not be loaded: %s", exc)
            return None

    def _build_model(self):
        examples = [
            [2, 1, 1, 0, 0, 0, 0.82],
            [1, 0, 0, 1, 0, 0, 0.86],
            [3, 1, 1, 1, 2, 0, 0.79],
            [4, 0, 0, 0, 0, 0, 0.71],
            [2, 0, 0, 1, 0, 0, 0.83],
            [2, 0, 0, 0, 0, 1, 0.74],
            [4, 1, 1, 0, 1, 0, 0.80],
            [0, 0, 0, 0, 0, 0, 0.10],
        ]
        labels = [
            "presentation",
            "speech",
            "panel discussion",
            "dance performance",
            "singing performance",
            "prize distribution",
            "cultural programme",
            "unknown",
        ]
        model = MLPClassifier(
            hidden_layer_sizes=(12, 8),
            max_iter=2000,
            random_state=42,
            learning_rate_init=0.02,
        )
        model.fit(np.array(examples, dtype=float), np.array(labels))
        return model

    def _feature_vector(self, detections):
        counts = Counter()
        confidence_values = []

        for detection in detections:
            label = str(detection.get("class_name", "unknown")).lower()
            counts[label] += 1
            confidence_values.append(float(detection.get("confidence", 0.0)))

        return [
            counts.get("person", 0),
            counts.get("laptop", 0),
            counts.get("tvmonitor", 0) + counts.get("monitor", 0),
            counts.get("microphone", 0),
            counts.get("chair", 0),
            counts.get("cell phone", 0) + counts.get("cellphone", 0),
            float(np.mean(confidence_values)) if confidence_values else 0.0,
        ]

    def _fallback_event_label(self, counts):
        people = counts.get("person", 0)
        laptop = counts.get("laptop", 0)
        microphone = counts.get("microphone", 0)
        chairs = counts.get("chair", 0)
        phone = counts.get("cell phone", 0) + counts.get("cellphone", 0)

        if people >= 1 and (laptop > 0 or counts.get("tvmonitor", 0) > 0):
            return "presentation"
        if microphone > 0 and people >= 1:
            return "speech"
        if people >= 3 and (chairs > 0 or microphone > 0):
            return "panel discussion"
        if people >= 2 and microphone > 0:
            return "singing performance"
        if people >= 2 and phone > 0:
            return "prize distribution"
        if people >= 2:
            return "cultural programme"
        return "unknown"

    def process_detections(self, detections):
        if not detections:
            return {
                "event_type": "unknown",
                "confidence": 0.0,
                "summary": "No clear event objects were detected in the uploaded video.",
                "top_objects": [],
            }

        counts = Counter()
        for detection in detections:
            label = str(detection.get("class_name", "unknown")).lower()
            counts[label] += 1

        feature_vector = self._feature_vector(detections)
        if self.model is not None:
            event_type = str(self.model.predict([feature_vector])[0])
            probabilities = self.model.predict_proba([feature_vector])[0]
            confidence = float(np.max(probabilities))
        else:
            event_type = self._fallback_event_label(counts)
            confidence = 0.52

        if event_type not in self.EVENT_LABELS:
            event_type = "unknown"

        event_summary = self._build_summary(event_type, counts)
        return {
            "event_type": event_type,
            "confidence": round(float(confidence), 3),
            "summary": event_summary,
            "top_objects": [{"class_name": label, "count": count} for label, count in counts.most_common(4)],
        }

    def _build_summary(self, event_type, counts):
        people = counts.get("person", 0)
        laptops = counts.get("laptop", 0)
        monitors = counts.get("tvmonitor", 0) + counts.get("monitor", 0)
        microphones = counts.get("microphone", 0)
        chairs = counts.get("chair", 0)

        if event_type == "presentation":
            return (
                f"A presentation event is being detected with {people} people and "
                f"{laptops + monitors} presentation device(s) visible."
            )
        if event_type == "speech":
            return (
                f"A speech or talk is likely happening, with {people} speaker(s) and "
                f"{microphones} microphone(s) detected."
            )
        if event_type == "panel discussion":
            return (
                f"A panel discussion is likely underway, with {people} participants and "
                f"{chairs} seating element(s) visible."
            )
        if event_type == "dance performance":
            return f"A dance performance is likely happening, with {people} dancers visible in the sequence."
        if event_type == "singing performance":
            return (
                f"A singing performance is likely happening, with {people} singer(s) and "
                f"{microphones} microphone(s) visible."
            )
        if event_type == "prize distribution":
            return f"A prize distribution event is likely happening, with {people} people and a presentation scene visible."
        if event_type == "cultural programme":
            return "A cultural programme is likely underway, with multiple people and stage objects suggesting an organised performance."
        return "The scene is too unclear to confidently classify a specific event."

    def run_yolo(self, frame):
        if self.yolo_model is None:
            return []

        result = self.yolo_model(frame, conf=0.25, verbose=False)
        detections = []
        height, width = frame.shape[:2]

        for item in result:
            boxes = item.boxes
            if boxes is None:
                continue
            for box in boxes:
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().tolist()
                cls_index = int(box.cls[0].cpu().item())
                class_name = item.names.get(cls_index, "object")
                confidence = float(box.conf[0].cpu().item())
                detections.append(
                    {
                        "class_name": class_name,
                        "confidence": confidence,
                        "bbox": [
                            round((x1 / width) * 100, 2),
                            round((y1 / height) * 100, 2),
                            round((x2 / width) * 100, 2),
                            round((y2 / height) * 100, 2),
                        ],
                    }
                )

        return detections


def extract_sample_frames(video_path: str, max_frames: int = 8):
    capture = cv2.VideoCapture(video_path)
    if not capture.isOpened():
        raise ValueError("Unable to read video file.")

    frames = []
    total_frames = int(capture.get(cv2.CAP_PROP_FRAME_COUNT))
    step = max(1, total_frames // max_frames)
    index = 0

    while True:
        ok, frame = capture.read()
        if not ok:
            break
        if index % step == 0 or len(frames) < max_frames:
            frames.append(frame)
            if len(frames) >= max_frames:
                break
        index += 1

    capture.release()
    return frames


def annotate_frame(frame, detections, label):
    annotated = frame.copy()
    height, width = annotated.shape[:2]

    for detection in detections:
        x1, y1, x2, y2 = detection["bbox"]
        pt1 = (int((x1 / 100) * width), int((y1 / 100) * height))
        pt2 = (int((x2 / 100) * width), int((y2 / 100) * height))
        cv2.rectangle(annotated, pt1, pt2, (0, 255, 0), 2)
        cv2.putText(
            annotated,
            f"{detection['class_name']} {detection['confidence']:.2f}",
            (pt1[0], max(10, pt1[1] - 10)),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.45,
            (255, 255, 255),
            1,
            cv2.LINE_AA,
        )

    cv2.putText(
        annotated,
        label.upper(),
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        1.0,
        (0, 255, 255),
        2,
        cv2.LINE_AA,
    )
    return annotated


def create_summary_video(frames, label, output_path: Path):
    if not frames:
        return None

    height, width = frames[0].shape[:2]
    writer = cv2.VideoWriter(
        str(output_path),
        cv2.VideoWriter_fourcc(*"mp4v"),
        5,
        (width, height),
    )

    if not writer.isOpened():
        return None

    for frame in frames:
        writer.write(annotate_frame(frame, [], label))
    writer.release()
    return output_path


def build_pdf_report(report: dict) -> bytes:
    summary = report.get("summary", "Event summary")
    event_type = report.get("event_type", "unknown")
    content = (
        f"BT /F1 18 Tf 50 760 Td (EventLens analysis report) Tj ET\n"
        f"BT /F1 12 Tf 50 730 Td ({event_type}) Tj ET\n"
        f"BT /F1 10 Tf 50 700 Td ({summary}) Tj ET\n"
    )
    return (
        b"%PDF-1.4\n"
        b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
        b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
        b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n"
        b"4 0 obj\n<< /Length 250 >>\nstream\n"
        + content.encode("latin-1")
        + b"endstream\nendobj\n"
        b"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"
        b"xref\n0 6\n0000000000 65535 f \n"
        b"0000000010 00000 n \n"
        b"0000000060 00000 n \n"
        b"0000000120 00000 n \n"
        b"0000000330 00000 n \n"
        b"0000000810 00000 n \n"
        b"trailer\n<< /Root 1 0 R /Size 6 >>\nstartxref\n900\n%%EOF"
    )


pipeline = EventPipeline()
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})


@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "ok", "timestamp": datetime.utcnow().isoformat()})


@app.route("/api/media/<path:filename>", methods=["GET"])
def serve_media(filename):
    return send_from_directory(GENERATED_DIR, filename)


@app.route("/api/analyze", methods=["POST"])
def analyze_video_route():
    if "video" not in request.files:
        return jsonify({"error": "No video file was included in the request."}), 400

    uploaded = request.files["video"]
    if uploaded.filename == "":
        return jsonify({"error": "No file was selected for analysis."}), 400

    safe_name = secure_filename(uploaded.filename)
    saved_name = f"{uuid.uuid4()}_{safe_name}"
    video_path = UPLOAD_DIR / saved_name
    uploaded.save(video_path)

    try:
        frames = extract_sample_frames(str(video_path), max_frames=8)
        detections = []
        for frame in frames:
            detections.extend(pipeline.run_yolo(frame))

        event_result = pipeline.process_detections(detections)
        annotated_frames = []
        for frame in frames:
            frame_detections = pipeline.run_yolo(frame)
            annotated_frames.append(annotate_frame(frame, frame_detections, event_result["event_type"]))

        annotated_name = None
        if annotated_frames:
            annotated_name = f"{uuid.uuid4()}.jpg"
            annotated_path = GENERATED_DIR / annotated_name
            cv2.imwrite(str(annotated_path), annotated_frames[0])

        summary_path = GENERATED_DIR / f"{uuid.uuid4()}.mp4"
        generated_video = create_summary_video(frames, event_result["event_type"], summary_path)
        generated_url = f"/api/media/{summary_path.name}" if generated_video else None

        report = {
            "id": str(uuid.uuid4()),
            "video_name": safe_name,
            "event_type": event_result["event_type"],
            "summary": event_result["summary"],
            "confidence": event_result["confidence"],
            "detections": detections,
            "events": [{
                "activity_name": event_result["event_type"],
                "start_seconds": 0,
                "end_seconds": max(1, len(frames) * 3),
                "confidence": event_result["confidence"],
            }],
            "annotated_frame_url": f"/api/media/{annotated_name}" if annotated_name else None,
            "generated_video_url": generated_url,
            "created_at": datetime.utcnow().isoformat(),
            "status": "completed",
        }
        REPORTS.append(report)

        return jsonify({
            "result": {
                "annotated_frame_url": report["annotated_frame_url"],
                "detections": detections,
                "events": report["events"],
                "summary": report["summary"],
                "event_type": report["event_type"],
                "generated_video_url": generated_url,
            },
            "report_id": report["id"],
            "report": report,
        }), 200
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:  # pragma: no cover
        logging.exception("Video analysis failed")
        return jsonify({"error": f"Analysis failed: {exc}"}), 500


@app.route("/api/reports", methods=["GET"])
def list_reports():
    return jsonify(REPORTS)


@app.route("/api/reports/<report_id>", methods=["GET"])
def get_report(report_id):
    for report in REPORTS:
        if report["id"] == report_id:
            return jsonify(report)
    return jsonify({"error": "Report not found"}), 404


@app.route("/api/reports/<report_id>/pdf", methods=["GET"])
def get_report_pdf(report_id):
    report = next((item for item in REPORTS if item["id"] == report_id), None)
    if not report:
        return jsonify({"error": "Report not found"}), 404
    return send_file(
        io.BytesIO(build_pdf_report(report)),
        mimetype="application/pdf",
        as_attachment=True,
        download_name=f"{report_id}.pdf",
    )


@app.route("/api/analyses", methods=["POST"])
def create_analysis_entry():
    payload = request.get_json(silent=True) or {}
    analysis_data = {
        "id": payload.get("id", str(uuid.uuid4())),
        "video_name": payload.get("video_name", "video.mp4"),
        "created_at": payload.get("created_at", datetime.utcnow().isoformat()),
        "status": payload.get("status", "completed"),
        "event_type": payload.get("event_type", "unknown"),
        "summary": payload.get("summary", "Analysis completed."),
    }
    REPORTS.append(analysis_data)
    return jsonify(analysis_data)


@app.route("/api/analyses/<analysis_id>", methods=["GET"])
def get_analysis_entry(analysis_id):
    for record in REPORTS:
        if record.get("id") == analysis_id:
            return jsonify(record)
    return jsonify({"error": "Analysis not found"}), 404


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
