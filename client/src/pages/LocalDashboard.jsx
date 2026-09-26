import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import api from "../services/api";
import useAuth from "../hooks/useAuth";
import BrandLogo from "../components/common/BrandLogo";

function LocalDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [decisions, setDecisions] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [decisionsResponse, applicationsResponse] = await Promise.all([
        api.get("/decisions?limit=20"),
        api.get("/applications"),
      ]);
      const apiDecisions = decisionsResponse.data.data || [];
      setDecisions(apiDecisions);
      setApplications(applicationsResponse.data.data || applicationsResponse.data.applications || []);
    } catch {
      setDecisions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const task = window.setTimeout(() => loadDashboard(), 0);
    return () => window.clearTimeout(task);
  }, [loadDashboard]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const todayDecisions = decisions.filter((item) => new Date(item.createdAt).toDateString() === today).length;
    const highRisk = decisions.filter((item) => ["high", "critical"].includes(item.riskLevel)).length;
    const pendingReviews = decisions.filter((item) => item.status === "flagged" || item.output?.decision === "human_review").length;
    const confidence = decisions.filter((item) => typeof item.confidence === "number");
    return [
      ["◈", "Total Decisions", decisions.length, "Across all connected AI applications", "+12.4%", "blue"],
      ["◷", "Decisions Today", todayDecisions, "Compared with yesterday", "Live data", "violet"],
      ["!", "High Risk Decisions", highRisk, "Require closer attention", highRisk ? "Needs review" : "Clear", "red"],
      ["✓", "Pending Human Reviews", pendingReviews, "Awaiting reviewer action", pendingReviews ? "Open queue" : "Clear", "amber"],
      ["⌁", "Average Confidence", confidence.length ? `${Math.round(confidence.reduce((sum, item) => sum + item.confidence, 0) / confidence.length * 100)}%` : "—", "Across recent decisions", "Live data", "green"],
      ["▣", "Active AI Applications", applications.filter((item) => item.status === "active").length, "Currently processing decisions", "Live data", "teal"],
    ];
  }, [applications, decisions]);

  return (
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <Link className="dashboard-logo" to="/dashboard"><BrandLogo className="dashboard-logo-image" variant="sidebar" /></Link>
        <p className="sidebar-label">WORKSPACE</p>
        <nav className="dashboard-nav" aria-label="Dashboard navigation">
          <Link className="dashboard-nav-link active" to="/dashboard"><span>▦</span> Dashboard</Link>
          <Link className="dashboard-nav-link" to="/decisions"><span>◈</span> Decisions</Link>
          <Link className="dashboard-nav-link" to="/applications"><span>▣</span> Applications</Link>
          <Link className="dashboard-nav-link" to="/reviews"><span>✓</span> Reviews</Link>
          <Link className="dashboard-nav-link" to="/analytics"><span>◫</span> Analytics</Link>
          <Link className="dashboard-nav-link" to="/audit-logs"><span>◫</span> Audit logs</Link>
          <Link className="dashboard-nav-link" to="/notifications"><span>●</span> Notifications</Link>
          <Link className="dashboard-nav-link" to="/profile"><span>○</span> Profile</Link>
        </nav>
        <div className="dashboard-sidebar-footer">
          <span className="sidebar-user-name">{user?.name}</span>
          <span className="sidebar-user-role">{user?.role}</span>
          <button className="sidebar-logout" onClick={handleLogout} type="button">Log out</button>
        </div>
      </aside>

      <section className="dashboard-main-panel">
        <header className="dashboard-topbar">
          <div>
            <p className="eyebrow">OVERVIEW</p>
            <h1>Dashboard</h1>
            <p className="dashboard-subtitle">Monitor AI decisions, risks, evidence and human reviews.</p>
          </div>
        </header>

        <div className="dashboard-stat-grid six">
          {stats.map(([icon, label, value, detail, change, tone]) => <StatCard key={label} icon={icon} label={label} value={value} detail={detail} change={change} tone={tone} />)}
        </div>

        <div className="dashboard-chart-grid">
          <section className="dashboard-content-card chart-card">
            <SectionHeading eyebrow="DECISION ACTIVITY" title="Decisions over time" note="Last 7 days" />
            <ActivityChart />
          </section>
          <section className="dashboard-content-card chart-card risk-chart-card">
            <SectionHeading eyebrow="RISK DISTRIBUTION" title="Risk levels" note="Current period" />
            <RiskChart decisions={decisions} />
          </section>
        </div>

        <section className="dashboard-content-card">
          <SectionHeading eyebrow="DECISION STREAM" title="Recent decisions" note="Showing latest 5" />
          {loading ? <div className="dashboard-empty">Loading decision activity...</div> : <DecisionTable decisions={decisions.slice(0, 5)} />}
        </section>

        <div className="dashboard-lower-grid">
          <section className="dashboard-content-card">
            <SectionHeading eyebrow="HUMAN REVIEW" title="Review queue" note="Requires intervention" />
            <ReviewQueue decisions={decisions.filter((item) => item.output?.decision === "human_review" || item.status === "flagged").slice(0, 3)} />
          </section>
          <section className="dashboard-content-card">
            <SectionHeading eyebrow="AUDIT TRAIL" title="Recent activity" note="Live events" />
            <ActivityTimeline />
          </section>
        </div>

        <section className="quick-actions">
          <div><p className="eyebrow">QUICK ACTIONS</p><h2>Move faster with DesT</h2></div>
          <div className="quick-action-list">
            <QuickAction icon="＋" label="Ingest decision" accent />
            <QuickAction icon="◈" label="View decisions" />
            <QuickAction icon="▶" label="Start replay" />
            <QuickAction icon="✓" label="Review pending" />
          </div>
        </section>
        <div className="dashboard-footer-note">DesT local workspace · {user?.email}</div>
      </section>
    </main>
  );
}

function StatCard({ icon, label, value, detail, change, tone }) {
  return <article className="dashboard-stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><p>{label}</p><strong>{value}</strong><div className="stat-detail"><span>{detail}</span><b>{change}</b></div></article>;
}

function SectionHeading({ eyebrow, title, note }) {
  return <div className="dashboard-section-heading"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div><span className="data-note">{note}</span></div>;
}

function ActivityChart() {
  return <div className="activity-chart"><div className="chart-legend"><span><i className="legend-dot blue" />All decisions</span><span><i className="legend-dot violet" />Approved</span><span><i className="legend-dot amber" />Review required</span></div><svg viewBox="0 0 720 230" role="img" aria-label="Decisions over the last seven days"><path className="chart-grid-line" d="M45 30H700M45 85H700M45 140H700M45 195H700" /><path className="chart-area" d="M45 174L150 144L255 157L360 92L465 119L570 65L675 91V195H45Z" /><path className="chart-line blue-line" d="M45 174L150 144L255 157L360 92L465 119L570 65L675 91" /><path className="chart-line violet-line" d="M45 185L150 177L255 181L360 151L465 161L570 130L675 139" /><path className="chart-line amber-line" d="M45 192L150 188L255 190L360 170L465 180L570 155L675 164" /><ChartLabels /></svg></div>;
}

function ChartLabels() {
  return <g className="chart-labels"><text x="38" y="220">19 Sep</text><text x="145" y="220">20 Sep</text><text x="250" y="220">21 Sep</text><text x="355" y="220">22 Sep</text><text x="460" y="220">23 Sep</text><text x="565" y="220">24 Sep</text><text x="665" y="220">Today</text></g>;
}

function RiskChart({ decisions }) {
  const values = ["low", "medium", "high", "critical"].map((risk) => decisions.filter((item) => item.riskLevel === risk).length);
  const total = values.reduce((sum, value) => sum + value, 0) || 1;
  const colors = ["#00c2ae", "#f59e0b", "#ef4444", "#7c3aed"];
  let offset = 0;
  const gradient = values.map((value, index) => { const start = offset; offset += value / total * 100; return `${colors[index]} ${start}% ${offset}%`; }).join(", ");
  return <div className="risk-chart"><div className="donut" style={{ background: `conic-gradient(${gradient})` }}><div><strong>{decisions.length}</strong><span>decisions</span></div></div><div className="risk-legend">{["Low", "Medium", "High", "Critical"].map((label, index) => <span key={label}><i style={{ background: colors[index] }} />{label}<b>{values[index]}</b></span>)}</div></div>;
}

function DecisionTable({ decisions }) {
  return <div className="decision-table-wrapper"><table className="decision-table"><thead><tr><th>Decision ID</th><th>Application</th><th>Decision</th><th>Confidence</th><th>Risk</th><th>Status</th><th>Timestamp</th><th>Action</th></tr></thead><tbody>{decisions.map((decision) => <tr key={decision._id}><td><strong>{decision.externalDecisionId}</strong></td><td>{decision.application?.name || "—"}</td><td>{decision.output?.decision || "—"}</td><td>{decision.confidence == null ? "—" : `${Math.round(decision.confidence * 100)}%`}</td><td><span className={`risk-pill ${decision.riskLevel}`}>{decision.riskLevel}</span></td><td><span className="status-pill">{decision.status}</span></td><td>{new Date(decision.createdAt).toLocaleDateString()}</td><td><button className="table-action">View</button><button className="table-action">Replay</button></td></tr>)}</tbody></table></div>;
}

function ReviewQueue({ decisions }) {
  return <div className="review-list">{decisions.length ? decisions.map((decision) => <div className="review-item" key={decision._id}><div><strong>{decision.externalDecisionId}</strong><span>{decision.application?.name} · {decision.riskLevel} risk</span></div><span className="review-status">{decision.status === "reviewed" ? "Reviewed" : "Pending"}</span><button className="small-action">Review</button></div>) : <div className="dashboard-empty">No decisions currently require human review.</div>}</div>;
}

function ActivityTimeline() {
  return <div className="activity-timeline"><div className="dashboard-empty">Activity will appear here as decisions and reviews are recorded.</div></div>;
}

function QuickAction({ icon, label, accent = false }) {
  return <button className={`quick-action ${accent ? "action-accent" : ""}`} type="button"><span>{icon}</span>{label}<b>→</b></button>;
}

export default LocalDashboard;
