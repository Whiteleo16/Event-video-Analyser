import api from "./api";
import { supabase } from "./supabase";

export async function getReports() {
  const { data } = await api.get("/reports");
  return data;
}

export async function getReport(id) {
  const { data } = await api.get(`/reports/${id}`);
  return data;
}

export async function downloadReportPdf(id, filename = `EventLens-report-${id}.pdf`) {
  const response = await api.get(`/reports/${id}/pdf`, { responseType: "blob" });
  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function createReportSignedUrl(storagePath) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const bucket = import.meta.env.VITE_STORAGE_REPORT_BUCKET || "event-reports";
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(storagePath, 60);
  if (error) throw error;
  return data.signedUrl;
}
