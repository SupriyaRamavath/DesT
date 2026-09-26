import { Link, Outlet, useLocation } from "react-router";
import useAuth from "../hooks/useAuth";
import useNotification from "../hooks/useNotification";

function DashboardLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification();

  const navigationItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "▦",
    },
    {
      name: "Decisions",
      path: "/decisions",
      icon: "◈",
    },
    {
      name: "Applications",
      path: "/applications",
      icon: "▣",
    },
    {
      name: "Reviews",
      path: "/reviews",
      icon: "✓",
    },
    {
      name: "Analytics",
      path: "/analytics",
      icon: "▥",
    },
    {
      name: "Audit Logs",
      path: "/audit-logs",
      icon: "◫",
    },
  ];

  const secondaryItems = [
    {
      name: "Notifications",
      path: "/notifications",
      icon: "●",
    },
    {
      name: "Profile",
      path: "/profile",
      icon: "○",
    },
  ];

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }

    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="dashboard-layout">
      {/* ================= SIDEBAR ================= */}
      <aside className="sidebar">
        {/* Logo */}
        <div className="sidebar-logo">
          <Link to="/dashboard">
            <div className="logo-mark">D</div>

            <div className="logo-text">
              <h2>DesT</h2>
              <span>AI Decision Audit</span>
            </div>
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="sidebar-navigation">
          <div className="navigation-section">
            <p className="navigation-title">MAIN</p>

            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`navigation-item ${
                  isActive(item.path) ? "active" : ""
                }`}
              >
                <span className="navigation-icon">
                  {item.icon}
                </span>

                <span className="navigation-label">
                  {item.name}
                </span>
              </Link>
            ))}
          </div>

          {/* Secondary Navigation */}
          <div className="navigation-section secondary-navigation">
            <p className="navigation-title">ACCOUNT</p>

            {secondaryItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`navigation-item ${
                  isActive(item.path) ? "active" : ""
                }`}
              >
                <span className="navigation-icon">
                  {item.icon}
                </span>

                <span className="navigation-label">
                  {item.name}
                </span>

                {item.name === "Notifications" &&
                  unreadCount > 0 && (
                    <span className="notification-count">
                      {unreadCount}
                    </span>
                  )}
              </Link>
            ))}
          </div>
        </nav>

        {/* User Section */}
        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.name
              ? user.name.charAt(0).toUpperCase()
              : "U"}
          </div>

          <div className="user-information">
            <strong>{user?.name || "User"}</strong>
            <small>{user?.role || "Developer"}</small>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
            title="Logout"
          >
            ↪
          </button>
        </div>
      </aside>

      {/* ================= MAIN AREA ================= */}
      <div className="dashboard-main">
        {/* Top Header */}
        <header className="dashboard-header">
          <div className="header-left">
            <h1>DesT</h1>
            <span className="header-divider">/</span>

            <span className="current-page">
              {getPageTitle(location.pathname)}
            </span>
          </div>

          <div className="header-right">
            {/* Notification */}
            <Link
              to="/notifications"
              className="header-notification"
              title="Notifications"
            >
              <span>●</span>

              {unreadCount > 0 && (
                <span className="header-notification-badge">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* User */}
            <Link
              to="/profile"
              className="header-user"
            >
              <div className="header-avatar">
                {user?.name
                  ? user.name.charAt(0).toUpperCase()
                  : "U"}
              </div>

              <div className="header-user-info">
                <strong>{user?.name || "User"}</strong>
                <small>
                  {user?.role || "Developer"}
                </small>
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

/* ============================================
   PAGE TITLE HELPER
============================================ */

function getPageTitle(pathname) {
  if (pathname === "/dashboard") {
    return "Dashboard";
  }

  if (pathname.startsWith("/decisions")) {
    if (pathname.includes("/replay")) {
      return "Decision Replay";
    }

    if (pathname.includes("/details")) {
      return "Decision Details";
    }

    return "Decisions";
  }

  if (pathname.startsWith("/applications")) {
    if (pathname.includes("/details")) {
      return "Application Details";
    }

    return "Applications";
  }

  if (pathname.startsWith("/reviews")) {
    if (pathname.includes("/details")) {
      return "Review Details";
    }

    return "Reviews";
  }

  if (pathname.startsWith("/analytics")) {
    return "Analytics";
  }

  if (pathname.startsWith("/audit-logs")) {
    return "Audit Logs";
  }

  if (pathname.startsWith("/notifications")) {
    return "Notifications";
  }

  if (pathname.startsWith("/profile")) {
    return "Profile";
  }

  return "Dashboard";
}

export default DashboardLayout;