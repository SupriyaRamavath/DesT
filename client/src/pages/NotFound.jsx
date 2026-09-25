import { Link } from "react-router";

function NotFound() {

  return (
    <div className="empty-page">

      <div className="error-code">
        404
      </div>

      <h1>Page Not Found</h1>

      <p>
        The page you are looking for does not exist.
      </p>

      <Link
        to="/dashboard"
        className="primary-button"
      >
        Go to Dashboard
      </Link>

    </div>
  );
}

export default NotFound;