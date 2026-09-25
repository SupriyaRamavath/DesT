import { Link, useLocation } from "react-router";
import useNotification from "../../hooks/useNotification";

function Sidebar() {
  const location = useLocation();
  const { unreadCount } = useNotification();

  const items = [
    {
      label: "Dashboard",
      path: "/dashboard",
      icon: "▦",
    },
    {
      label: "Decisions",
      path: "/decisions",
      icon: "◈",
    },
    {
      label: "Applications",
      path: "/applications",
      icon: "▣",
    },
    {
      label: "Reviews",
      path: "/reviews",
      icon: "✓",
    },
    {
      label: "Analytics",
      path: "/analytics",
      icon: "▥",
    },
    {
      label: "Audit Logs",
      path: "/audit-logs",
      icon: "◫",
    },
    {
      label: "Notifications",
      path: "/notifications",
      icon: "●",
    },
    {
      label: "Profile",
      path: "/profile",
      icon: "○",
    },
  ];

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === path;
    }

    return location.pathname.startsWith(path);
  };

  return (
    <aside className="sidebar-component">
      <div className="sidebar-component-logo">
        <Link to="/dashboard">
          <div className="sidebar-logo-mark">
            D
          </div>

          <div>
            <strong>DecisionTrace</strong>
            <small>AI Decision Audit</small>
          </div>
        </Link>
      </div>

      <nav className="sidebar-component-nav">
        {items.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-component-item ${
              isActive(item.path)
                ? "active"
                : ""
            }`}
          >
            <span>{item.icon}</span>

            <span>{item.label}</span>

            {item.label === "Notifications" &&
              unreadCount > 0 && (
                <span className="notification-count">
                  {unreadCount}
                </span>
              )}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;