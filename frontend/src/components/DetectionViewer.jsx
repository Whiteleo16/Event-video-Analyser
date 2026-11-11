import { ScanLine } from "lucide-react";

export default function DetectionViewer({ imageUrl, detections = [] }) {
  return <div className="detection-panel">
    {imageUrl ? <div className="detection-image-wrap"><img src={imageUrl} alt="Analysed frame"/>{detections.map((d, i) => {
      const [x1,y1,x2,y2] = d.bbox || d.bbox_xyxy || [];
      if ([x1,y1,x2,y2].some(v => typeof v !== "number")) return null;
      return <div key={i} className="bbox" style={{left:`${x1}%`,top:`${y1}%`,width:`${x2-x1}%`,height:`${y2-y1}%`}}><span>{d.class_name || d.label || "Object"} · {Math.round((d.confidence || 0)*100)}%</span></div>;
    })}</div> : <div className="empty-preview"><ScanLine size={28}/><span>Annotated frames will appear here after backend analysis is connected.</span></div>}
  </div>;
}
