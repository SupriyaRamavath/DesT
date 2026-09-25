import { Link, useParams } from "react-router";

function ApplicationDetails() {

  const { id } = useParams();

  return (
    <div>

      <div className="breadcrumb">
        <Link to="/applications">
          Applications
        </Link>
        <span>/</span>
        <span>{id}</span>
      </div>

      <div className="page-header">

        <div>
          <h1>Resume Screening AI</h1>
          <p>{id} · AI Application</p>
        </div>

        <button className="secondary-button">
          Edit Application
        </button>

      </div>

      <div className="detail-grid">

        <div className="panel">

          <h2>Application Information</h2>

          <div className="detail-list">

            <div>
              <span>Name</span>
              <strong>Resume Screening AI</strong>
            </div>

            <div>
              <span>Status</span>
              <span className="badge active">
                Active
              </span>
            </div>

            <div>
              <span>Environment</span>
              <strong>Production</strong>
            </div>

            <div>
              <span>Integration</span>
              <strong>REST API</strong>
            </div>

          </div>

        </div>

        <div className="panel">

          <h2>Usage</h2>

          <div className="metric-big">
            <span>428</span>
            <small>Total Decisions</small>
          </div>

          <div className="metric-row">
            <span>Average Confidence</span>
            <strong>91%</strong>
          </div>

          <div className="metric-row">
            <span>High Risk Decisions</span>
            <strong>12</strong>
          </div>

        </div>

      </div>

      <div className="panel">

        <h2>API Integration</h2>

        <p className="panel-description">
          Send decision traces from this application to
          DecisionTrace using the ingestion API.
        </p>

        <div className="code-box">
          POST /api/decisions/ingest
        </div>

      </div>

    </div>
  );
}

export default ApplicationDetails;