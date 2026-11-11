import { LogOut, UserRound } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { signOut } from "../services/auth";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const name = user?.user_metadata?.full_name || user?.email?.split("@")[0] || "User";
  async function handleLogout() {
    try { await signOut(); navigate("/login"); }
    catch (error) { alert(error.message); }
  }
  return <header className="topbar">
    <div><span className="topbar-kicker">YOUR EVENT, UNDERSTOOD</span><span className="topbar-title">Event intelligence workspace</span></div>
    <div className="topbar-user"><span className="avatar"><UserRound size={17}/></span><span className="user-name">{name}</span><button className="icon-button" onClick={handleLogout} title="Sign out"><LogOut size={18}/></button></div>
  </header>;
}
