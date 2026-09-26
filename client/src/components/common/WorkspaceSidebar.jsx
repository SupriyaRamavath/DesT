import { Link, useLocation, useNavigate } from "react-router";
import useAuth from "../../hooks/useAuth";
import BrandLogo from "./BrandLogo";

function WorkspaceSidebar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isActive = (path) => pathname === path || pathname.startsWith(`${path}/`);

  return (
    <aside className="dashboard-sidebar">
      <Link className="dashboard-logo" to="/dashboard"><BrandLogo className="dashboard-logo-image" variant="sidebar" /></Link>
      <p className="sidebar-label">WORKSPACE</p>
      <nav className="dashboard-nav" aria-label="Dashboard navigation">
        <Link className={`dashboard-nav-link ${isActive("/dashboard") ? "active" : ""}`} to="/dashboard"><span>▦</span> Dashboard</Link>
        <Link className={`dashboard-nav-link ${isActive("/decisions") ? "active" : ""}`} to="/decisions"><span>◈</span> Decisions</Link>
        <Link className={`dashboard-nav-link ${isActive("/applications") ? "active" : ""}`} to="/applications"><span>▣</span> Applications</Link>
        <Link className={`dashboard-nav-link ${isActive("/reviews") ? "active" : ""}`} to="/reviews"><span>✓</span> Reviews</Link>
        <Link className={`dashboard-nav-link ${isActive("/analytics") ? "active" : ""}`} to="/analytics"><span>◫</span> Analytics</Link>
        <Link className={`dashboard-nav-link ${isActive("/audit-logs") ? "active" : ""}`} to="/audit-logs"><span>◫</span> Audit logs</Link>
        <Link className={`dashboard-nav-link ${isActive("/notifications") ? "active" : ""}`} to="/notifications"><span>●</span> Notifications</Link>
        <Link className={`dashboard-nav-link ${isActive("/profile") ? "active" : ""}`} to="/profile"><span>○</span> Profile</Link>
      </nav>
      <div className="dashboard-sidebar-footer">
        <span className="sidebar-user-name">{user?.name}</span>
        <span className="sidebar-user-role">{user?.role}</span>
        <button className="sidebar-logout" onClick={() => { logout(); navigate("/login"); }} type="button">Log out</button>
      </div>
    </aside>
  );
}

export default WorkspaceSidebar;
