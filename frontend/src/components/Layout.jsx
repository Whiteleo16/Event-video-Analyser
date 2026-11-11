import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout() {
  return <div className="app-shell"><Sidebar/><div className="main-shell"><Navbar/><main className="main-content"><Outlet/></main><footer className="app-footer">© {new Date().getFullYear()} EventLens <span>Understand every moment.</span></footer></div></div>;
}
