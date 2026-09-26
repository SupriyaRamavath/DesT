import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import api from "../services/api";
import WorkspaceSidebar from "../components/common/WorkspaceSidebar";

function Applications() {
  const [applications, setApplications] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", environment: "development" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => api.get("/applications")
    .then((response) => setApplications(response.data.data || []))
    .catch(() => setError("Unable to load AI applications."));
  useEffect(() => {
    load().finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => applications.filter((item) => {
    const query = search.toLowerCase();
    return (!query || `${item.name} ${item.description}`.toLowerCase().includes(query)) && (!status || item.status === status);
  }), [applications, search, status]);

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/applications", form);
      setForm({ name: "", description: "", environment: "development" });
      setShowForm(false);
      setLoading(true);
      load().finally(() => setLoading(false));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to create application.");
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (application) => {
    try {
      await api.patch(`/applications/${application.id}/${application.status === "active" ? "deactivate" : "activate"}`);
      setLoading(true);
      load().finally(() => setLoading(false));
    } catch {
      setError("Unable to change application status.");
    }
  };

  const remove = async (application) => {
    if (!window.confirm(`Delete ${application.name}? This also removes its decisions.`)) return;
    try {
      await api.delete(`/applications/${application.id}`);
      setLoading(true);
      load().finally(() => setLoading(false));
    } catch {
      setError("Unable to delete application.");
    }
  };

  const stats = [
    ["Total Applications", applications.length],
    ["Active", applications.filter((item) => item.status === "active").length],
    ["Inactive", applications.filter((item) => item.status === "inactive").length],
    ["Suspended", applications.filter((item) => item.status === "suspended").length],
  ];

  return <main className="dashboard-shell"><WorkspaceSidebar /><section className="dashboard-main-panel applications-page">
    <header className="decisions-page-header"><div><p className="eyebrow">AI SYSTEMS</p><h1>AI Applications</h1><p className="dashboard-subtitle">Monitor and audit the AI systems connected to DesT.</p></div><button className="primary-button action-accent" type="button" onClick={() => setShowForm((value) => !value)}>＋ Add Application</button></header>
    {error && <div className="error-message">{error}</div>}
    {showForm && <form className="application-create-form" onSubmit={save}><Link className="application-form-back" to="/applications" onClick={(event) => { event.preventDefault(); setShowForm(false); }}>← Back to Applications</Link><h2>Add AI application</h2><div className="ingest-grid"><label>Name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Environment<select value={form.environment} onChange={(event) => setForm({ ...form, environment: event.target.value })}><option value="development">Development</option><option value="staging">Staging</option><option value="production">Production</option></select></label><label className="ingest-full">Description<textarea rows="3" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label></div><div className="application-form-actions"><button className="secondary-button" type="button" onClick={() => setShowForm(false)}>Cancel</button><button className="primary-button action-accent" disabled={saving} type="submit">{saving ? "Saving..." : "Save Application"}</button></div></form>}
    <div className="decision-stats-row application-stats">{stats.map(([label, value]) => <div className="decision-stat" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div>
    <section className="application-toolbar"><input placeholder="Search applications..." value={search} onChange={(event) => setSearch(event.target.value)} /><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option></select></section>
    {loading ? <div className="dashboard-empty">Loading applications...</div> : !filtered.length ? <div className="dashboard-content-card dashboard-empty"><strong>No AI applications connected yet.</strong><p>Connect your first AI system to begin monitoring decisions.</p><button className="primary-button action-accent" type="button" onClick={() => setShowForm(true)}>＋ Add Application</button></div> : <section className="application-list">{filtered.map((application) => <article className="application-row" key={application.id}><div className="application-avatar">AI</div><div className="application-main"><div className="application-title"><h2>{application.name}</h2><span className={`application-status ${application.status}`}>{capitalize(application.status)}</span></div><p>{application.description || "No description provided."}</p><div className="application-meta"><span>{capitalize(application.environment)} environment</span><span>{application.decisions || 0} decisions</span><span>Created {formatDate(application.createdAt)}</span></div></div><div className="application-actions"><Link to={`/applications/${application.id}`}>View</Link><button type="button" onClick={() => changeStatus(application)}>{application.status === "active" ? "Deactivate" : "Activate"}</button><button className="danger-action" type="button" onClick={() => remove(application)}>Delete</button></div></article>)}</section>}
  </section></main>;
}

function capitalize(value) { return String(value || "").replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function formatDate(value) { return value ? new Date(value).toLocaleDateString() : "—"; }
export default Applications;
