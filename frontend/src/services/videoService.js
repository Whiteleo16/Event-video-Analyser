import api from "./api";
import { supabase } from "./supabase";

export async function uploadVideoToBackend(file, onUploadProgress) {
  const body = new FormData();
  body.append("video", file);
  const { data } = await api.post("/analyze", body, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress
  });
  return data;
}

// Optional direct private Storage upload. Configure the bucket and Storage RLS policies first.
export async function uploadVideoToSupabase(file, userId) {
  if (!supabase) throw new Error("Supabase is not configured.");
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${userId}/${crypto.randomUUID()}/${safeName}`;
  const bucket = import.meta.env.VITE_STORAGE_VIDEO_BUCKET || "event-videos";
  const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "application/octet-stream"
  });
  if (error) throw error;
  return { path: data.path, bucket };
}

export async function startAnalysis(payload) {
  const { data } = await api.post("/analyses", payload);
  return data;
}

export async function getAnalysis(id) {
  const { data } = await api.get(`/analyses/${id}`);
  return data;
}
