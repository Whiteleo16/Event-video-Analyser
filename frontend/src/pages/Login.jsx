import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import Brand from "../components/Brand";
import { signIn } from "../services/auth";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const [email,setEmail] = useState(""); const [password,setPassword] = useState("");
  const [show,setShow] = useState(false); const [busy,setBusy] = useState(false); const [error,setError] = useState("");
  const { isConfigured } = useAuth(); const navigate = useNavigate(); const location = useLocation();
  async function submit(e) {
    e.preventDefault(); setError(""); setBusy(true);
    try { await signIn({email,password}); navigate(location.state?.from?.pathname || "/dashboard", {replace:true}); }
    catch(err) { setError(err.message); } finally { setBusy(false); }
  }
  return <div className="auth-page"><section className="auth-visual"><Brand light/><div className="auth-visual-content"><span className="overline"><i/> YOUR EVENT, UNDERSTOOD</span><h1>Make sense<br/>of every <em>moment.</em></h1><p>Turn long-form event videos into clear, timestamped reports you can review and share.</p><div className="auth-steps"><div><b>01</b><span><strong>Detect key activity</strong><small>Identify what happens on stage.</small></span></div><div><b>02</b><span><strong>Build the timeline</strong><small>Keep moments and timestamps together.</small></span></div><div><b>03</b><span><strong>Generate a report</strong><small>Make event footage easier to review.</small></span></div></div></div><div className="visual-orbit"/></section>
  <section className="auth-form-side"><div className="auth-form-wrap"><div className="eyebrow">WELCOME BACK</div><h2>Sign in to EventLens</h2><p className="auth-subtitle">Your event intelligence workspace is waiting.</p>
  {!isConfigured && <div className="notice">Supabase setup required: add your project URL and publishable key to <code>.env.local</code>, then restart Vite.</div>}
  <form onSubmit={submit} className="form-stack"><label>Email address<div className="input-wrap"><Mail size={18}/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required/></div></label>
  <label><span className="label-row">Password <Link to="/forgot-password">Forgot password?</Link></span><div className="input-wrap"><LockKeyhole size={18}/><input type={show?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password" required/><button type="button" className="input-icon-button" onClick={()=>setShow(!show)}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label>
  {error && <p className="field-error">{error}</p>}<button className="primary-button full" disabled={busy || !isConfigured}>{busy?"Signing in…":"Sign in"} <ArrowRight size={18}/></button></form>
  <p className="auth-switch">New to EventLens? <Link to="/register">Create an account</Link></p><div className="auth-foot"><LockKeyhole size={14}/> Your details are protected by Supabase Auth.</div></div></section></div>;
}
