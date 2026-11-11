import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import Brand from "../components/Brand";
import { sendPasswordReset } from "../services/auth";
import { useAuth } from "../hooks/useAuth";

export default function ForgotPassword(){
  const [email,setEmail]=useState("");const [busy,setBusy]=useState(false);const [error,setError]=useState("");const [success,setSuccess]=useState("");const {isConfigured}=useAuth();
  async function submit(e){e.preventDefault();setBusy(true);setError("");setSuccess("");try{await sendPasswordReset(email);setSuccess("If an account exists for this email, a password reset link will be sent.");}catch(err){setError(err.message);}finally{setBusy(false);}}
  return <div className="auth-page"><section className="auth-visual"><Brand light/><div className="auth-visual-content"><span className="overline"><i/> ACCOUNT SUPPORT</span><h1>Back to<br/>your <em>moments.</em></h1><p>Recover access to your EventLens workspace securely.</p></div><div className="visual-orbit"/></section><section className="auth-form-side"><div className="auth-form-wrap"><div className="eyebrow">ACCOUNT RECOVERY</div><h2>Forgot password?</h2><p className="auth-subtitle">Enter your registered email and we'll send a reset link.</p><form className="form-stack" onSubmit={submit}><label>Email address<div className="input-wrap"><Mail size={18}/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required/></div></label>{error&&<p className="field-error">{error}</p>}{success&&<p className="success-message">{success}</p>}<button className="primary-button full" disabled={busy||!isConfigured}>{busy?"Sending…":"Send reset link"}</button></form><p className="auth-switch"><Link to="/login"><ArrowLeft size={14}/> Back to sign in</Link></p></div></section></div>;
}
