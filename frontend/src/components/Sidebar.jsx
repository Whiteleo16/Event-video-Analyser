import { NavLink } from "react-router-dom";
import { LayoutDashboard, ScanLine, FileText, Settings2, CircleHelp } from "lucide-react";
import Brand from "./Brand";

const links = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/analysis", label: "Analyse video", icon: ScanLine },
  { to: "/reports", label: "Reports library", icon: FileText }
];

export default function Sidebar() {
  return <aside className="sidebar">
    <Brand />
    <div className="nav-label">WORKSPACE</div>
    <nav className="side-nav">{links.map(({ to, label, icon: Icon }) =>
      <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
        <Icon size={18}/><span>{label}</span>
      </NavLink>)}</nav>
    <div className="sidebar-bottom">
      <div className="sidebar-note"><div className="note-icon"><CircleHelp size={17}/></div><strong>Need a hand?</strong><span>EventLens turns event footage into organised insights.</span></div>
      <div className="nav-link muted"><Settings2 size={18}/><span>Workspace settings</span></div>
      <div className="sidebar-version">EVENTLENS · VERSION 1.0</div>
    </div>
  </aside>;
}
