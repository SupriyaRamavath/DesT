import { Link } from "react-router";

function ApplicationCard({
  application,
}) {
  if (!application) {
    return null;
  }

  const id =
    application._id ||
    application.id;

  return (
    <div className="application-card">
      <div className="application-card-header">
        <div className="application-icon">
          AI
        </div>

        <span
          className={`application-status ${
            String(
              application.status || "Active"
            ).toLowerCase()
          }`}
        >
          {application.status ||
            "Active"}
        </span>
      </div>

      <div className="application-card-body">
        <h3>
          {application.name ||
            "Unnamed Application"}
        </h3>

        <p>
          {application.description ||
            "No description available."}
        </p>

        <div className="application-meta">
          <span>
            Environment:{" "}
            {application.environment ||
              "Production"}
          </span>

          <span>
            Decisions:{" "}
            {application.decisionCount ??
              0}
          </span>
        </div>
      </div>

      <div className="application-card-footer">
        <Link
          to={`/applications/${id}`}
          className="secondary-button"
        >
          View Application
        </Link>
      </div>
    </div>
  );
}

export default ApplicationCard;