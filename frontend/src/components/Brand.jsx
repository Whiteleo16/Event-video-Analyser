import { Aperture } from "lucide-react";
import { Link } from "react-router-dom";

export default function Brand({ light = false }) {
  return (
    <Link to="/" className={`brand ${light ? "brand-light" : ""}`}>
      <span className="brand-mark"><Aperture size={21} strokeWidth={2.5} /></span>
      <span><strong>eventlens</strong><small>VIDEO INTELLIGENCE</small></span>
    </Link>
  );
}
