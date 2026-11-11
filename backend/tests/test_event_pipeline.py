import math

from app import EventPipeline


def test_event_pipeline_classifies_event_and_summary():
    pipeline = EventPipeline()

    sample_detections = [
        {"class_name": "person", "confidence": 0.95, "bbox": [10, 20, 40, 80]},
        {"class_name": "person", "confidence": 0.94, "bbox": [50, 18, 76, 82]},
        {"class_name": "laptop", "confidence": 0.87, "bbox": [30, 40, 55, 70]},
        {"class_name": "tvmonitor", "confidence": 0.82, "bbox": [80, 30, 95, 70]},
    ]

    result = pipeline.process_detections(sample_detections)

    assert result["event_type"] in {
        "presentation",
        "speech",
        "panel discussion",
    }
    assert "summary" in result
    assert len(result["summary"]) > 20
    assert result["confidence"] >= 0.0
    assert result["confidence"] <= 1.0


def test_event_pipeline_handles_empty_detections():
    pipeline = EventPipeline()

    result = pipeline.process_detections([])

    assert result["event_type"] == "unknown"
    assert "summary" in result
