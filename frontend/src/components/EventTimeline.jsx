import { Clock3 } from "lucide-react";

function time(value = 0) {
  const seconds = Math.max(0, Math.floor(Number(value) || 0));
  return `${String(Math.floor(seconds/60)).padStart(2,"0")}:${String(seconds%60).padStart(2,"0")}`;
}
export default function EventTimeline({ events = [] }) {
  if (!events.length) return <div className="empty-state compact"><Clock3 size={22}/><span>Activity segments will appear here after classification is connected.</span></div>;
  return <div className="timeline">{events.map((event, i) => <div className="timeline-item" key={event.id || i}><span className="timeline-dot"/><div><strong>{event.activity_name || event.label || "Activity"}</strong><small>{time(event.start_seconds)} – {time(event.end_seconds)} · {Math.max(0, (event.end_seconds || 0) - (event.start_seconds || 0)).toFixed(0)} sec</small></div><span className="confidence">{event.confidence != null ? `${Math.round(event.confidence*100)}%` : "—"}</span></div>)}</div>;
}
