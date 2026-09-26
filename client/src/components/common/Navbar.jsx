import { Link } from "react-router";
import useAuth from "../../hooks/useAuth";
import useNotification from "../../hooks/useNotification";

function Navbar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotification();

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <Link to="/dashboard">
          <strong>DesT</strong>
        </Link>
      </div>

      <div className="navbar-actions">
        <Link
          to="/notifications"
          className="navbar-notification"
        >
          Notifications

          {unreadCount > 0 && (
            <span className="notification-count">
              {unreadCount}
            </span>
          )}
        </Link>

        <Link
          to="/profile"
          className="navbar-user"
        >
          <span className="navbar-avatar">
            {user?.name
              ? user.name.charAt(0).toUpperCase()
              : "U"}
          </span>

          <span>
            {user?.name || "User"}
          </span>
        </Link>

        <button
          type="button"
          onClick={logout}
          className="navbar-logout"
        >
          Logout
        </button>
      </div>
    </header>
  );
}

export default Navbar;