import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import api from "../services/api";
import BrandLogo from "../components/common/BrandLogo";

function Decisions() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [applications, setApplications] = useState([]);
  const [filters, setFilters] = useState({ search: "", application: "", result: "", risk: "", confidence: "", status: "", date: "", sort: "newest" });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const pageSize = 5;

  useEffect(() => {
    let active = true;
    Promise.all([api.get("/decisions?limit=100"), api.get("/applications")])
      .then(([decisionResponse, applicationResponse]) => {
        if (!active) return;
        const data = decisionResponse.data.data || [];
        setRecords(data);
        setApplications(applicationResponse.data.data || applicationResponse.data.applications || []);
      })
      .catch(() => {
        if (!active) return;
        setError("Unable to load decisions. Check that the local API is running and try again.");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return records.filter((decision) => {
      const searchable = [decision.externalDecisionId, decision.title, decision.inputSummary, JSON.stringify(decision.output)].join(" ").toLowerCase();
      const confidence = typeof decision.confidence === "number" ? decision.confidence * 100 : null;
      const result = normalizeResult(decision.output?.decision);
      return (!query || searchable.includes(query))
        && (!filters.application || decision.application?.name === filters.application)
        && (!filters.result || result === filters.result)
        && (!filters.risk || decision.riskLevel === filters.risk)
        && (!filters.status || decision.status === filters.status)
        && (!filters.confidence || confidenceRange(confidence, filters.confidence))
        && (!filters.date || new Date(decision.createdAt).toISOString().slice(0, 10) === filters.date);
    }).sort((a, b) => {
      if (filters.sort === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (filters.sort === "highest-risk") return riskWeight(b.riskLevel) - riskWeight(a.riskLevel);
      if (filters.sort === "lowest-confidence") return (a.confidence ?? 1) - (b.confidence ?? 1);
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [filters, records]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const updateFilter = (name, value) => {
    setPage(1);
    setFilters((current) => ({ ...current, [name]: value }));
  };
  const stats = [
    ["Total Decisions", filtered.length],
    ["Completed", filtered.filter((item) => item.status === "completed").length],
    ["Review Required", filtered.filter((item) => normalizeResult(item.output?.decision) === "Review Required").length],
    ["High Risk", filtered.filter((item) => ["high", "critical"].includes(item.riskLevel)).length],
    ["Failed", filtered.filter((item) => item.status === "failed").length],
  ];

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <Link className="dashboard-logo" to="/dashboard"><BrandLogo className="dashboard-logo-image" variant="sidebar" /></Link>
        <p className="sidebar-label">WORKSPACE</p>
        <nav className="dashboard-nav" aria-label="Dashboard navigation">
          <Link className="dashboard-nav-link" to="/dashboard"><span>▦</span> Dashboard</Link>
          <Link className="dashboard-nav-link active" to="/decisions"><span>◈</span> Decisions</Link>
          <Link className="dashboard-nav-link" to="/applications"><span>▣</span> Applications</Link>
          <Link className="dashboard-nav-link" to="/reviews"><span>✓</span> Reviews</Link>
          <Link className="dashboard-nav-link" to="/analytics"><span>◫</span> Analytics</Link>
          <Link className="dashboard-nav-link" to="/audit-logs"><span>◫</span> Audit logs</Link>
          <Link className="dashboard-nav-link" to="/notifications"><span>●</span> Notifications</Link>
          <Link className="dashboard-nav-link" to="/profile"><span>○</span> Profile</Link>
        </nav>
      </aside>
      <section className="dashboard-main-panel decisions-page">
        <header className="decisions-page-header">
          <div><p className="eyebrow">DECISION INTELLIGENCE</p><h1>Decisions</h1><p className="dashboard-subtitle">Explore and trace AI-powered decisions across your applications.</p></div>
          <button className="primary-button action-accent" type="button" onClick={() => navigate("/decisions/ingest")}>＋ Ingest Decision</button>
        </header>
        {error && <div className="error-message">{error}</div>}
        <div className="decision-stats-row">{stats.map(([label, value]) => <div className="decision-stat" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
        <section className="decision-toolbar">
          <div className="decision-search"><span>⌕</span><input aria-label="Search decisions" placeholder="Search by ID, application, input or output..." value={filters.search} onChange={(event) => updateFilter("search", event.target.value)} /></div>
          <div className="decision-filter-grid">
            <select aria-label="Application filter" value={filters.application} onChange={(event) => updateFilter("application", event.target.value)}><option value="">All applications</option>{applications.map((item) => <option key={item._id}>{item.name}</option>)}</select>
            <select aria-label="Decision result filter" value={filters.result} onChange={(event) => updateFilter("result", event.target.value)}><option value="">All results</option>{["Approved", "Rejected", "Qualified", "Not Qualified", "Review Required"].map((item) => <option key={item}>{item}</option>)}</select>
            <select aria-label="Risk filter" value={filters.risk} onChange={(event) => updateFilter("risk", event.target.value)}><option value="">All risk levels</option>{["low", "medium", "high", "critical"].map((item) => <option key={item} value={item}>{capitalize(item)}</option>)}</select>
            <select aria-label="Confidence filter" value={filters.confidence} onChange={(event) => updateFilter("confidence", event.target.value)}><option value="">Any confidence</option><option value="high">80–100%</option><option value="medium">60–79%</option><option value="low">0–59%</option></select>
            <select aria-label="Status filter" value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}><option value="">All statuses</option>{["completed", "flagged", "reviewed", "failed", "pending"].map((item) => <option key={item}>{item}</option>)}</select>
            <input aria-label="Date filter" type="date" value={filters.date} onChange={(event) => updateFilter("date", event.target.value)} />
            <select aria-label="Sort decisions" value={filters.sort} onChange={(event) => updateFilter("sort", event.target.value)}><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="highest-risk">Highest risk</option><option value="lowest-confidence">Lowest confidence</option></select>
          </div>
        </section>
        <section className="dashboard-content-card decisions-table-card">
          <div className="dashboard-section-heading"><div><p className="eyebrow">TRACE LIBRARY</p><h2>Decision records</h2></div><span className="data-note">{filtered.length} matching records</span></div>
          {loading ? <div className="dashboard-empty">Loading decisions...</div> : visible.length === 0 ? <div className="dashboard-empty"><strong>No decisions match your filters</strong><p>Try clearing a filter or ingest a new decision.</p></div> : <DecisionTable decisions={visible} navigate={navigate} />}
          {!loading && pages > 1 && <div className="decisions-pagination"><span>Page {page} of {pages}</span><div><button type="button" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>{Array.from({ length: pages }, (_, index) => index + 1).map((number) => <button className={number === page ? "active" : ""} key={number} type="button" onClick={() => setPage(number)}>{number}</button>)}<button type="button" disabled={page === pages} onClick={() => setPage(page + 1)}>Next</button></div></div>}
        </section>
      </section>
    </main>
  );
}

function DecisionTable({ decisions, navigate }) {
  return <div className="decision-table-wrapper"><table className="decision-table decisions-table"><thead><tr><th>Decision ID</th><th>Application</th><th>Input</th><th>Result</th><th>Confidence</th><th>Risk</th><th>Status</th><th>Created At</th><th>Actions</th></tr></thead><tbody>{decisions.map((decision) => <tr key={decision._id}><td><strong>{decision.externalDecisionId}</strong></td><td>{decision.application?.name || "—"}</td><td className="input-cell">{decision.inputSummary || "Decision trace input"}</td><td><span className={`result-badge ${resultClass(decision.output?.decision)}`}>{normalizeResult(decision.output?.decision)}</span></td><td>{decision.confidence == null ? "—" : `${Math.round(decision.confidence * 100)}%`}</td><td><span className={`risk-pill ${decision.riskLevel}`}>{capitalize(decision.riskLevel)}</span></td><td><span className="status-pill">{capitalize(decision.status)}</span></td><td>{new Date(decision.createdAt).toLocaleDateString()}</td><td><button className="table-action" type="button" onClick={() => navigate(`/decisions/${decision._id}`)}>View</button><button className="table-action" type="button" onClick={() => navigate(`/decisions/${decision._id}/replay`)}>Replay</button><button className="table-action flag-action" type="button">Flag</button></td></tr>)}</tbody></table></div>;
}

function normalizeResult(value) {
  return { human_review: "Review Required", approved: "Approved", rejected: "Rejected", qualified: "Qualified", not_qualified: "Not Qualified" }[value] || capitalize(value || "Pending");
}
function resultClass(value) { return String(value || "").replace("_", "-") || "pending"; }
function confidenceRange(value, range) { return range === "high" ? value >= 80 : range === "medium" ? value >= 60 && value < 80 : value < 60; }
function riskWeight(value) { return { low: 1, medium: 2, high: 3, critical: 4 }[value] || 0; }
function capitalize(value) { return String(value || "").replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }

export default Decisions;
