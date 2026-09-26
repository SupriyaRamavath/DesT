import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { getApplications } from "../services/applicationService";
import { getDecisions } from "../services/decisionService";
import Loading from "../components/common/Loading";
import ErrorMessage from "../components/common/ErrorMessage";

function Dashboard() {
  const [decisions, setDecisions] = useState([]);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const requestId = useRef(0);

  const fetchDashboard = useCallback((currentRequest) => {
    Promise.all([getDecisions(), getApplications()])
      .then(([decisionResponse, applicationResponse]) => {
        if (currentRequest !== requestId.current) return;
        setDecisions(Array.isArray(decisionResponse.data) ? decisionResponse.data : []);
        setApplications(Array.isArray(applicationResponse.data) ? applicationResponse.data : []);
      })
      .catch(() => {
        if (currentRequest === requestId.current) setError("Unable to load dashboard data.");
      })
      .finally(() => {
        if (currentRequest === requestId.current) setLoading(false);
      });
  }, []);

  const loadDashboard = useCallback(() => {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError("");
    fetchDashboard(currentRequest);
  }, [fetchDashboard]);

  useEffect(() => {
    const currentRequest = ++requestId.current;
    fetchDashboard(currentRequest);
    return () => { requestId.current += 1; };
  }, [fetchDashboard]);

  const riskCounts = useMemo(() => decisions.reduce((counts, decision) => {
    const risk = (decision.riskLevel || "low").toLowerCase();
    counts[risk] = (counts[risk] || 0) + 1;
    return counts;
  }, {}), [decisions]);

  const total = decisions.length;
  const highRisk = (riskCounts.high || 0) + (riskCounts.critical || 0);
  const percent = (count) => total ? `${Math.round((count / total) * 100)}%` : "0%";
  const stats = [
    ["Total Decisions", total, "◈"],
    ["High Risk Decisions", highRisk, "⚠"],
    ["Pending Reviews", decisions.filter((item) => item.status === "flagged").length, "✓"],
    ["AI Applications", applications.length, "▣"],
  ];

  if (loading) return <Loading message="Loading dashboard..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadDashboard} />;

  return (
    <div>
      <div className="page-header">
        <div><h1>Dashboard</h1><p>Monitor AI decisions, risks, and review activity.</p></div>
        <Link to="/applications" className="primary-button action-accent">+ Add Application</Link>
      </div>
      {error && <p className="error-message">{error}</p>}
      <div className="stats-grid">
        {stats.map(([title, value, icon]) => (
          <div className="stat-card" key={title}><div className="stat-icon">{icon}</div><div><p>{title}</p><h2>{value}</h2><span className="stat-change">Live data</span></div></div>
        ))}
      </div>
      <div className="dashboard-grid">
        <div className="panel">
          <div className="panel-header"><div><h2>Risk Distribution</h2><p>Current decision risk levels.</p></div></div>
          {["low", "medium", "high", "critical"].map((risk) => (
            <div className="risk-item" key={risk}><span>{risk}</span><strong>{percent(riskCounts[risk] || 0)}</strong><div className="progress"><div className={`progress-fill ${risk}`} style={{ width: percent(riskCounts[risk] || 0) }} /></div></div>
          ))}
        </div>
        <div className="panel">
          <div className="panel-header"><div><h2>Applications</h2><p>Connected AI systems.</p></div><Link to="/applications">Manage →</Link></div>
          {applications.slice(0, 5).map((application) => <div className="metric-row" key={application.id}><span>{application.name}</span><strong>{application.decisions}</strong></div>)}
          {!applications.length && <p>No applications registered yet.</p>}
        </div>
      </div>
      <div className="panel">
        <div className="panel-header"><div><h2>Recent Decisions</h2><p>Latest decisions captured by DesT.</p></div><Link to="/decisions">View all →</Link></div>
        <div className="table-container"><table><thead><tr><th>ID</th><th>Application</th><th>Status</th><th>Risk</th><th>Created</th></tr></thead><tbody>
          {decisions.slice(0, 8).map((decision) => <tr key={decision._id}><td><Link to={`/decisions/${decision._id}`} className="table-link">{decision.externalDecisionId}</Link></td><td>{decision.application?.name || "Unknown"}</td><td>{decision.status}</td><td><span className={`badge ${decision.riskLevel}`}>{decision.riskLevel}</span></td><td>{new Date(decision.createdAt).toLocaleString()}</td></tr>)}
          {!decisions.length && <tr><td colSpan="5">No decisions recorded yet.</td></tr>}
        </tbody></table></div>
      </div>
    </div>
  );
}

export default Dashboard;
