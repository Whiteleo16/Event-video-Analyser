import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute() {
  const { user, loading, isConfigured } = useAuth();
  const location = useLocation();
  if (loading) return <div className="screen-loader">Loading your workspace…</div>;
  if (!isConfigured) return <Navigate to="/login" replace state={{ from: location }} />;
  return user ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}
