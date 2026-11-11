import { useCallback, useState } from "react";
import { uploadVideoToBackend } from "../services/videoService";

export function useAnalysis() {
  const [status, setStatus] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const analyze = useCallback(async (file) => {
    setStatus("uploading");
    setProgress(0);
    setResult(null);
    setError("");
    try {
      const data = await uploadVideoToBackend(file, (event) => {
        if (event.total) setProgress(Math.round((event.loaded / event.total) * 100));
      });
      setResult(data);
      setStatus("completed");
      return data;
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.error || err.message || "Analysis request failed.";
      setError(message);
      setStatus("failed");
      throw err;
    }
  }, []);

  return { status, progress, result, error, analyze, reset: () => {
    setStatus("idle"); setProgress(0); setResult(null); setError("");
  }};
}
