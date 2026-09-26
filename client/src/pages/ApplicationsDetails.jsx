import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import api from "../services/api";
import WorkspaceSidebar from "../components/common/WorkspaceSidebar";

function ApplicationsDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/applications/${id}`).then((response) => setData(response.data.data)).catch(() => setError("Application not found or unavailable."));
  }, [id]);

  if (error) return <main className="dashboard-shell"><WorkspaceSidebar /><section className="dashboard-main-panel"><Link className="detail-back" to="/applications">← Back to Applications</Link><div className="dashboard-empty"><strong>{error}</strong></div></section></main>;
  if (!data) return <main className="dashboard-shell"><WorkspaceSidebar /><section className="dashboard-main-panel"><div className="dashboard-empty">Loading application details...</div></section></main>;
  const { application, decisions, stats } = data;

  return <main className="dashboard-shell"><WorkspaceSidebar /><section className="dashboard-main-panel application-detail-page"><div className="detail-back"><Link to="/applications">← Back to Applications</Link></div><header className="detail-header"><div><p className="eyebrow">AI APPLICATION</p><h1>{application.name}</h1><p className="dashboard-subtitle">{capitalize(application.environment)} · {capitalize(application.status)}</p></div><div className="detail-actions"><button className="secondary-button" type="button">Edit Application</button><Link className="primary-button" to="/decisions">View Decisions</Link></div></header><div className="application-detail-stats">{[["Total Decisions", stats.totalDecisions], ["Decisions Today", stats.decisionsToday], ["High Risk", stats.highRisk], ["Average Confidence", stats.averageConfidence == null ? "—" : `${Math.round(stats.averageConfidence * 100)}%`], ["Review Required", stats.reviewRequired]].map(([label, value]) => <div className="decision-stat" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><div className="application-detail-grid"><section className="detail-card"><CardHeading title="Application Overview" /><div className="detail-list"><span>Description <b>{application.description || "No description provided."}</b></span><span>Owner <b>Current workspace owner</b></span><span>Environment <b>{capitalize(application.environment)}</b></span><span>Model <b>Not recorded</b></span><span>Version <b>Not recorded</b></span><span>Created date <b>{formatDate(application.createdAt)}</b></span><span>Last activity <b>{decisions[0] ? formatDate(decisions[0].createdAt) : "No activity"}</b></span></div></section><section className="detail-card"><CardHeading title="Risk Overview" /><div className="risk-overview-list">{["low", "medium", "high", "critical"].map((risk) => <div key={risk}><span>{capitalize(risk)}</span><b>{stats.riskDistribution?.find((item) => item._id === risk)?.count || 0}</b></div>)}</div></section><section className="detail-card detail-wide"><CardHeading title="Decision Activity" /><div className="mini-bars">{[35, 52, 44, 78, 60, 88, 72].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div><div className="chart-labels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Today</span></div></section><section className="detail-card detail-wide"><CardHeading title="Recent Decisions" />{decisions.length ? <div className="decision-table-wrapper"><table className="decision-table"><thead><tr><th>Decision ID</th><th>Result</th><th>Confidence</th><th>Risk</th><th>Status</th><th>Timestamp</th></tr></thead><tbody>{decisions.map((decision) => <tr key={decision._id}><td>{decision.externalDecisionId}</td><td>{resultLabel(decision.output?.decision)}</td><td>{decision.confidence == null ? "—" : `${Math.round(decision.confidence * 100)}%`}</td><td><span className={`risk-pill ${decision.riskLevel}`}>{capitalize(decision.riskLevel)}</span></td><td><span className="status-pill">{capitalize(decision.status)}</span></td><td>{formatDate(decision.createdAt)}</td></tr>)}</tbody></table></div> : <div className="dashboard-empty">No decisions recorded for this application.</div>}</section><section className="detail-card detail-wide"><CardHeading title="Recent Audit Events" /><div className="dashboard-empty">Audit events will appear here as this application is used.</div></section></div></section></main>;
}

function CardHeading({ title }) { return <div className="detail-card-heading"><p className="eyebrow">{title.toUpperCase()}</p><h2>{title}</h2></div>; }
function capitalize(value) { return String(value || "").replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function formatDate(value) { return value ? new Date(value).toLocaleString() : "—"; }
function resultLabel(value) { return { human_review: "Review Required", approved: "Approved", rejected: "Rejected" }[value] || capitalize(value || "Pending"); }
export default ApplicationsDetails;
