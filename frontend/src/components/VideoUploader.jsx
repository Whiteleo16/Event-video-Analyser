import { useRef, useState } from "react";
import { FileVideo, UploadCloud, X } from "lucide-react";

const MAX_BYTES = 500 * 1024 * 1024;
const ACCEPTED = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"];

export default function VideoUploader({ onFileSelected, disabled = false }) {
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  function choose(candidate) {
    if (!candidate) return;
    if (!(ACCEPTED.includes(candidate.type) || /\.(mp4|mov|avi|webm)$/i.test(candidate.name))) {
      setError("Please choose an MP4, MOV, AVI or WebM video."); return;
    }
    if (candidate.size > MAX_BYTES) { setError("Video must be 500 MB or smaller."); return; }
    setError(""); setFile(candidate); onFileSelected(candidate);
  }
  function clear() { setFile(null); setError(""); onFileSelected(null); if (inputRef.current) inputRef.current.value = ""; }

  return <div>
    <input ref={inputRef} hidden type="file" accept="video/mp4,video/quicktime,video/x-msvideo,video/webm,.mp4,.mov,.avi,.webm" onChange={e => choose(e.target.files?.[0])}/>
    {!file ? <button type="button" disabled={disabled} className={`dropzone ${dragging ? "dragging" : ""}`} onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={e => { e.preventDefault(); setDragging(false); choose(e.dataTransfer.files?.[0]); }}>
      <span className="upload-icon"><UploadCloud size={26}/></span><strong>Drop your event video here</strong><span>or <b>browse files</b> from your device</span><small>MP4, MOV, AVI or WebM · Maximum 500 MB</small>
    </button> : <div className="selected-file"><FileVideo size={24}/><div><strong>{file.name}</strong><small>{(file.size / (1024 * 1024)).toFixed(1)} MB</small></div><button className="icon-button" onClick={clear} type="button"><X size={18}/></button></div>}
    {error && <p className="field-error">{error}</p>}
  </div>;
}
