import { useEffect, useState } from "react";
import { Activity, ArrowRight, FileCheck2, FileVideo, ScanLine, UploadCloud } from "lucide-react";
import { Link } from "react-router-dom";
import PageHeading from "../components/PageHeading";
import StatCard from "../components/StatCard";
import ReportCard from "../components/ReportCard";
import { getReports } from "../services/reportService";

export default function Dashboard(){
  const [reports,setReports]=useState([]);const [loading,setLoading]=useState(true);const [message,setMessage]=useState("");
  useEffect(()=>{getReports().then(data=>setReports(Array.isArray(data)?data:(data.reports||[]))).catch(()=>setMessage("Backend is not connected yet. Your dashboard is ready; report data will appear when the API is available.")).finally(()=>setLoading(false));},[]);
  return <><PageHeading eyebrow="WORKSPACE OVERVIEW" title="Good to see you." description="A clear view of your event analysis activity." action={<Link className="primary-button" to="/analysis"><UploadCloud size={17}/> Analyse a video</Link>}/><div className="stats-grid"><StatCard label="Videos analysed" value={reports.length} note="Reports available" icon={FileVideo}/><StatCard label="Reports generated" value={reports.length} note="Completed reports" icon={FileCheck2} tone="lime"/><StatCard label="Activity segments" value="—" note="Connect classifier to view" icon={Activity} tone="blue"/><StatCard label="Detection status" value="Ready" note="Awaiting backend pipeline" icon={ScanLine} tone="dark"/></div>
  <section className="section-block"><div className="section-title-row"><div><h2>Recent reports</h2><p>Your latest analysed event videos.</p></div><Link to="/reports" className="text-link">View all <ArrowRight size={15}/></Link></div>{message&&<div className="notice">{message}</div>}{loading?<div className="empty-state">Loading reports…</div>:reports.length?<div className="report-list">{reports.slice(0,4).map((r,i)=><ReportCard key={r.id||i} report={r}/>)}</div>:<div className="empty-state"><FileVideo size={28}/><strong>No reports yet</strong><span>Upload your first event video to begin.</span><Link className="secondary-button" to="/analysis">Start an analysis <ArrowRight size={15}/></Link></div>}</section>
  <section className="getting-started"><div><span className="eyebrow">YOUR NEXT STEP</span><h2>Turn a recording into a clear story.</h2><p>Upload a cultural programme, presentation or stage performance to begin your analysis.</p><Link to="/analysis" className="text-link">Upload an event video <ArrowRight size={16}/></Link></div><div className="getting-icon"><ScanLine size={46}/></div></section></>;
}
