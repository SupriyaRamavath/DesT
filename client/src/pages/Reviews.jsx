import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import api from "../services/api";
import WorkspaceSidebar from "../components/common/WorkspaceSidebar";

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [filters, setFilters] = useState({ status: "", risk: "", application: "", reviewer: "", date: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/reviews?limit=100")
      .then((response) => setReviews(response.data.data || []))
      .catch((requestError) => setError(requestError.response?.data?.message || "Unable to load human reviews."))
      .finally(() => setLoading(false));
  }, []);

  const applications = [...new Set(reviews.map((review) => review.decision?.application?.name).filter(Boolean))];
  const reviewers = [...new Set(reviews.map((review) => review.reviewer?.name).filter(Boolean))];
  const filtered = useMemo(() => reviews.filter((review) => {
    const decision = review.decision || {};
    return (!filters.status || review.status === filters.status)
      && (!filters.risk || decision.riskLevel === filters.risk)
      && (!filters.application || decision.application?.name === filters.application)
      && (!filters.reviewer || review.reviewer?.name === filters.reviewer)
      && (!filters.date || new Date(review.createdAt).toISOString().slice(0, 10) === filters.date);
  }), [filters, reviews]);
  const setFilter = (name, value) => setFilters((current) => ({ ...current, [name]: value }));
  const stats = [
    ["Pending Reviews", reviews.filter((item) => item.status === "pending").length],
    ["Approved", reviews.filter((item) => item.status === "approved").length],
    ["Rejected", reviews.filter((item) => item.status === "rejected").length],
    ["Modified", reviews.filter((item) => item.status === "modified").length],
  ];

  return <main className="dashboard-shell"><WorkspaceSidebar /><section className="dashboard-main-panel reviews-page">
    <header className="decisions-page-header"><div><p className="eyebrow">HUMAN-IN-THE-LOOP</p><h1>Human Reviews</h1><p className="dashboard-subtitle">Review AI decisions that require human intervention.</p></div></header>
    {error && <div className="error-message">{error}</div>}
    <div className="decision-stats-row">{stats.map(([label, value]) => <div className="decision-stat" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
    <section className="review-filter-bar"><select aria-label="Review status" value={filters.status} onChange={(event) => setFilter("status", event.target.value)}><option value="">All review statuses</option>{["pending", "approved", "rejected", "modified"].map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Risk level" value={filters.risk} onChange={(event) => setFilter("risk", event.target.value)}><option value="">All risk levels</option>{["low", "medium", "high", "critical"].map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Application" value={filters.application} onChange={(event) => setFilter("application", event.target.value)}><option value="">All applications</option>{applications.map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Reviewer" value={filters.reviewer} onChange={(event) => setFilter("reviewer", event.target.value)}><option value="">All reviewers</option>{reviewers.map((item) => <option key={item}>{item}</option>)}</select><input aria-label="Review date" type="date" value={filters.date} onChange={(event) => setFilter("date", event.target.value)} /></section>
    {loading ? <div className="dashboard-empty">Loading reviews...</div> : !filtered.length ? <div className="dashboard-content-card dashboard-empty"><strong>No pending human reviews.</strong><p>Review items will appear here when an AI decision requires oversight.</p></div> : <section className="dashboard-content-card decisions-table-card"><div className="dashboard-section-heading"><div><p className="eyebrow">REVIEW QUEUE</p><h2>Decision reviews</h2></div><span className="data-note">{filtered.length} records</span></div><div className="decision-table-wrapper"><table className="decision-table review-table"><thead><tr><th>Review ID</th><th>Decision ID</th><th>Application</th><th>AI Decision</th><th>Risk</th><th>Confidence</th><th>Review Status</th><th>Assigned Reviewer</th><th>Created At</th><th>Action</th></tr></thead><tbody>{filtered.map((review) => { const decision = review.decision || {}; return <tr className={review.status === "pending" ? "review-row-pending" : ""} key={review._id}><td>{shortId(review._id)}</td><td>{decision.externalDecisionId || "—"}</td><td>{decision.application?.name || "—"}</td><td>{resultLabel(decision.output?.decision)}</td><td><span className={`risk-pill ${decision.riskLevel}`}>{capitalize(decision.riskLevel)}</span></td><td>{decision.confidence == null ? "—" : `${Math.round(decision.confidence * 100)}%`}</td><td><span className={`review-status ${review.status}`}>{capitalize(review.status)}</span></td><td>{review.reviewer?.name || "Unassigned"}</td><td>{formatDate(review.createdAt)}</td><td><div className="review-actions"><Link to={`/reviews/${review._id}`}>Review</Link><Link to={`/decisions/${decision._id}`}>View</Link><Link to={`/decisions/${decision._id}/replay`}>Replay</Link></div></td></tr>; })}</tbody></table></div></section>}
  </section></main>;
}

const capitalize = (value) => String(value || "").replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const shortId = (value) => value ? `REV-${String(value).slice(-6).toUpperCase()}` : "—";
const formatDate = (value) => value ? new Date(value).toLocaleString() : "—";
const resultLabel = (value) => ({ approved: "Approved", rejected: "Rejected", human_review: "Review Required" }[value] || capitalize(value || "Pending"));
export default Reviews;
