import { useEffect, useState } from "react";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import PageHeading from "../components/PageHeading";
import EventTimeline from "../components/EventTimeline";
import { downloadReportPdf, getReport } from "../services/reportService";

export default function ReportDetails(){
  const {id}=useParams();const [report,setReport]=useState(null);const [loading,setLoading]=useState(true);const [error,setError]=useState("");
  useEffect(()=>{getReport(id).then(data=>setReport(data.report||data)).catch(e=>setError("Report details could not be loaded. Check that the backend report endpoint is implemented.")).finally(()=>setLoading(false));},[id]);
  if(loading)return <div className="empty-state">Loading report…</div>;
  if(error||!report)return <><Link to="/reports" className="text-link"><ArrowLeft size={15}/> Back to reports</Link><div className="notice">{error||"Report not found."}</div></>;
  const events=report.events||report.analysis?.events||[];
  return <><Link to="/reports" className="text-link back-link"><ArrowLeft size={15}/> Back to reports</Link><PageHeading eyebrow="REPORT DETAILS" title={report.report_title||"Event analysis report"} description={`Generated ${report.created_at?new Date(report.created_at).toLocaleString():"date unavailable"}`} action={<button className="primary-button" onClick={()=>downloadReportPdf(id)}><Download size={17}/> Download PDF</button>}/><div className="panel report-detail-panel"><div className="report-detail-icon"><FileText size={28}/></div><h2>Analysis summary</h2><p>{report.summary||"The structured summary will be shown here when the backend report generator is connected."}</p><div className="detail-stats"><div><small>Activity segments</small><strong>{events.length}</strong></div><div><small>Report status</small><strong>{report.status||"Completed"}</strong></div><div><small>Video</small><strong>{report.video_name||"Event video"}</strong></div></div></div><section className="section-block"><h2>Event timeline</h2><div className="panel"><EventTimeline events={events}/></div></section></>;
}
