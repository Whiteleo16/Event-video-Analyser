import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Analysis from "./pages/Analysis";
import Reports from "./pages/Reports";
import ReportDetails from "./pages/ReportDetails";

export default function App(){
  return <Routes>
    <Route path="/login" element={<Login/>}/>
    <Route path="/register" element={<Register/>}/>
    <Route path="/forgot-password" element={<ForgotPassword/>}/>
    <Route element={<ProtectedRoute/>}>
      <Route element={<Layout/>}>
        <Route path="/" element={<Navigate to="/dashboard" replace/>}/>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path="/analysis" element={<Analysis/>}/>
        <Route path="/reports" element={<Reports/>}/>
        <Route path="/reports/:id" element={<ReportDetails/>}/>
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
  </Routes>;
}
