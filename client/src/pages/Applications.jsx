import { useEffect, useState } from "react";
import { Link } from "react-router";
import ApplicationForm from "../components/applications/ApllicationForm";
import { createApplication, getApplications } from "../services/applicationService";

function Applications() {
  const [applications, setApplications] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const loadApplications = () => {
    getApplications()
      .then((response) => setApplications(response.data || []))
      .catch(() => setError("Unable to load applications."));
  };

  useEffect(() => loadApplications(), []);

  const handleCreate = (data) => {
    createApplication(data)
      .then(() => {
        setShowForm(false);
        loadApplications();
      })
      .catch((requestError) => setError(requestError.response?.data?.message || "Unable to save application."));
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>AI Applications</h1>
          <p>Manage AI systems connected to DecisionTrace.</p>
        </div>
        <button className="primary-button" onClick={() => setShowForm(true)}>+ Register Application</button>
      </div>
      {error && <p className="error-message">{error}</p>}
      {showForm && (
        <div className="panel">
          <h2>Register application</h2>
          <ApplicationForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}
      <div className="application-grid">
        {applications.map((application) => (
          <div className="application-card" key={application.id}>
            <div className="application-icon">AI</div>
            <div className="application-content">
              <div className="application-header">
                <div><h2>{application.name}</h2><span>{application.id}</span></div>
                <span className={`badge ${application.status}`}>{application.status}</span>
              </div>
              <p>{application.description || "No description provided."}</p>
              <div className="application-footer">
                <span><strong>{application.decisions}</strong> decisions</span>
                <Link to={`/applications/${application.id}`} className="table-link">View →</Link>
              </div>
            </div>
          </div>
        ))}
        {!applications.length && <div className="panel"><p>No applications yet. Register your first AI application.</p></div>}
      </div>
    </div>
  );
}

export default Applications;
