import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import WorkspaceSidebar from "../components/common/WorkspaceSidebar";

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [filters, setFilters] = useState({ search: "", type: "", actor: "", application: "", decision: "", severity: "", date: "" });
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const pageSize = 10;

  useEffect(() => {
    api.get("/audit-logs?limit=100")
      .then((response) => setLogs(response.data.data || []))
      .catch((requestError) => setError(requestError.response?.data?.message || "Unable to load audit logs."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => logs.filter((log) => {
    const value = `${log.action} ${log.resourceType} ${log.resourceId || ""} ${log.actor?.name || ""} ${JSON.stringify(log.metadata || {})}`.toLowerCase();
    return (!filters.search || value.includes(filters.search.toLowerCase()))
      && (!filters.type || log.resourceType === filters.type)
      && (!filters.actor || log.actor?.name === filters.actor)
      && (!filters.application || log.resourceType.toLowerCase().includes("application") || log.metadata?.application === filters.application)
      && (!filters.decision || String(log.resourceId) === filters.decision)
      && (!filters.severity || severity(log) === filters.severity)
      && (!filters.date || new Date(log.createdAt).toISOString().slice(0, 10) === filters.date);
  }), [filters, logs]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page - 1) * pageSize, page * pageSize);
  const actors = [...new Set(logs.map((log) => log.actor?.name).filter(Boolean))];
  const types = [...new Set(logs.map((log) => log.resourceType).filter(Boolean))];
  const stats = [["Total Events", logs.length], ["Decision Events", logs.filter((log) => log.resourceType === "Decision").length], ["User Actions", logs.filter((log) => log.actor).length], ["Review Actions", logs.filter((log) => log.action.startsWith("review_")).length], ["System Events", logs.filter((log) => !log.actor).length]];
  const setFilter = (name, value) => { setPage(1); setFilters((current) => ({ ...current, [name]: value })); };

  const exportLogs = () => {
    const rows = [["Timestamp", "Event ID", "Event Type", "Actor", "Resource", "Action", "Severity", "Metadata"], ...filtered.map((log) => [log.createdAt, log._id, log.resourceType, log.actor?.name || "System", log.resourceId || "", log.action, severity(log), JSON.stringify(log.metadata || {})])];
    const blob = new Blob([rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "dest-audit-logs.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return <main className="dashboard-shell"><WorkspaceSidebar /><section className="dashboard-main-panel audit-page">
    <header className="decisions-page-header"><div><p className="eyebrow">GOVERNANCE TRAIL</p><h1>Audit Logs</h1><p className="dashboard-subtitle">Track who did what, when, and in which decision or application.</p></div><button className="primary-button action-accent" type="button" onClick={exportLogs} disabled={!logs.length}>Export Logs</button></header>
    {error && <div className="error-message">{error}</div>}
    <div className="decision-stats-row audit-stats">{stats.map(([label, value]) => <div className="decision-stat" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
    <section className="audit-filter-bar"><div className="audit-search"><span>⌕</span><input aria-label="Search audit logs" placeholder="Search events, actions, actors..." value={filters.search} onChange={(event) => setFilter("search", event.target.value)} /></div><select aria-label="Event type" value={filters.type} onChange={(event) => setFilter("type", event.target.value)}><option value="">All event types</option>{types.map((type) => <option key={type}>{type}</option>)}</select><select aria-label="User" value={filters.actor} onChange={(event) => setFilter("actor", event.target.value)}><option value="">All users</option>{actors.map((actor) => <option key={actor}>{actor}</option>)}</select><select aria-label="Severity" value={filters.severity} onChange={(event) => setFilter("severity", event.target.value)}><option value="">All severity</option><option value="info">Info</option><option value="warning">Warning</option><option value="critical">Critical</option></select><input aria-label="Date range" type="date" value={filters.date} onChange={(event) => setFilter("date", event.target.value)} /></section>
    {loading ? <div className="dashboard-empty">Loading audit logs...</div> : !visible.length ? <div className="dashboard-content-card dashboard-empty"><strong>No audit events found.</strong><p>Important decision, review, application, and system events will appear here.</p></div> : <section className="dashboard-content-card decisions-table-card"><div className="dashboard-section-heading"><div><p className="eyebrow">CHRONOLOGICAL RECORD</p><h2>System events</h2></div><span className="data-note">{filtered.length} matching events</span></div><div className="decision-table-wrapper"><table className="decision-table audit-table"><thead><tr><th>Timestamp</th><th>Event ID</th><th>Event Type</th><th>Actor</th><th>Resource</th><th>Action</th><th>Description</th><th>Severity</th><th>View</th></tr></thead><tbody>{visible.map((log) => <tr key={log._id}><td>{formatDate(log.createdAt)}</td><td>{shortId(log._id)}</td><td>{log.resourceType}</td><td>{log.actor?.name || "System"}</td><td>{shortId(log.resourceId)}</td><td>{formatAction(log.action)}</td><td>{description(log)}</td><td><span className={`audit-severity ${severity(log)}`}>{severity(log)}</span></td><td><button className="table-link-button" type="button" onClick={() => setSelected(log)}>View</button></td></tr>)}</tbody></table></div><div className="audit-pagination"><button type="button" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {pages}</span><button type="button" disabled={page === pages} onClick={() => setPage(page + 1)}>Next</button></div></section>}
    {selected && <div className="audit-modal-backdrop" role="presentation" onClick={() => setSelected(null)}><section className="audit-event-panel" role="dialog" aria-modal="true" aria-labelledby="audit-event-title" onClick={(event) => event.stopPropagation()}><button className="audit-close" type="button" onClick={() => setSelected(null)} aria-label="Close event details">×</button><p className="eyebrow">EVENT DETAILS</p><h2 id="audit-event-title">{formatAction(selected.action)}</h2><div className="audit-detail-list"><span>Event ID <b>{selected._id}</b></span><span>Timestamp <b>{formatDate(selected.createdAt)}</b></span><span>Actor <b>{selected.actor?.name || "System"}</b></span><span>Resource <b>{selected.resourceType} / {selected.resourceId || "—"}</b></span><span>IP address <b>{selected.ipAddress || "Not recorded"}</b></span></div><label>Metadata<pre>{JSON.stringify(selected.metadata || {}, null, 2)}</pre></label><button className="secondary-button" type="button" onClick={() => setSelected(null)}>Close</button></section></div>}
  </section></main>;
}

function severity(log) { if (["application_deleted", "review_reject", "system_error"].includes(log.action)) return "critical"; if (["review_created", "review_modify", "decision_flagged", "application_updated"].includes(log.action)) return "warning"; return "info"; }
function formatAction(value) { return String(value || "event").replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function description(log) { return log.metadata?.description || log.metadata?.reason || `${formatAction(log.action)} on ${log.resourceType}.`; }
function shortId(value) { return value ? String(value).slice(-10).toUpperCase() : "—"; }
function formatDate(value) { return value ? new Date(value).toLocaleString() : "—"; }
export default AuditLogs;
