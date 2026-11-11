import { ArrowUpRight, Download, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { downloadReportPdf } from "../services/reportService";

export default function ReportCard({ report }) {
  const id = report.id || report.analysis_id;
  const date = report.created_at ? new Date(report.created_at).toLocaleDateString() : "Date unavailable";
  return <article className="report-card"><div className="report-file-icon"><FileText size={22}/></div><div className="report-info"><strong>{report.report_title || report.video_name || "Event analysis report"}</strong><small>{date} · {report.status || "Completed"}</small></div><span className="status-pill success">Ready</span><Link className="icon-button" to={`/reports/${id}`} title="View report"><ArrowUpRight size={18}/></Link><button className="icon-button" title="Download PDF" onClick={() => downloadReportPdf(id).catch(e => alert(e.message))}><Download size={18}/></button></article>;
}
