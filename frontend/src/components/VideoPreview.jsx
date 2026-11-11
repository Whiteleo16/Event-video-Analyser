import { useEffect, useState } from "react";
import { Film } from "lucide-react";

export default function VideoPreview({ file }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (!file) { setUrl(""); return; }
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  if (!file || !url) return <div className="empty-preview"><Film size={28}/><span>Your video preview will appear here</span></div>;
  return <video className="video-preview" src={url} controls preload="metadata"/>;
}
