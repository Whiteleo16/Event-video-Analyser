import { useEffect, useState } from "react";
import { FileText, Search } from "lucide-react";
import PageHeading from "../components/PageHeading";
import ReportCard from "../components/ReportCard";
import { getReports } from "../services/reportService";

export default function Reports(){
  const [reports,setReports]=useState([]);const [query,setQuery]=useState("");const [loading,setLoading]=useState(true);const [error,setError]=useState("");
  useEffect(()=>{getReports().then(data=>setReports(Array.isArray(data)?data:(data.reports||[]))).catch(e=>setError("Could not load reports. Connect the backend API to display saved reports.")).finally(()=>setLoading(false));},[]);
  const filtered=reports.filter(r=>(r.report_title||r.video_name||"").toLowerCase().includes(query.toLowerCase()));
  return <><PageHeading eyebrow="REPORT LIBRARY" title="Generated reports" description="Access, review and download your analysed event reports."/><div className="toolbar"><div className="search-box"><Search size={17}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search reports…"/></div><span className="muted-text">{reports.length} reports</span></div>{error&&<div className="notice">{error}</div>}{loading?<div className="empty-state">Loading reports…</div>:filtered.length?<div className="report-list">{filtered.map((r,i)=><ReportCard key={r.id||i} report={r}/>)}</div>:<div className="empty-state"><FileText size={30}/><strong>{query?"No matching reports":"Your report library is empty"}</strong><span>Completed event analyses will appear here.</span></div>}</>;
}
