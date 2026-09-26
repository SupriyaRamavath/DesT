import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import WorkspaceSidebar from "../components/common/WorkspaceSidebar";

function Analytics() {
  const [range, setRange] = useState("30");
  const [custom, setCustom] = useState({ from: "", to: "" });
  const [data, setData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const to = range === "custom" && custom.to ? new Date(`${custom.to}T23:59:59`) : new Date();
    const from = range === "custom" && custom.from ? new Date(`${custom.from}T00:00:00`) : new Date(to);
    if (range === "0") from.setHours(0, 0, 0, 0);
    else if (range !== "custom") from.setDate(to.getDate() - Number(range));
    Promise.all([
      api.get("/analytics/dashboard", { params: { from: from.toISOString(), to: to.toISOString() } }),
      api.get("/analytics/applications", { params: { from: from.toISOString(), to: to.toISOString() } }),
    ]).then(([summary, apps]) => {
      setData(summary.data.data);
      setApplications(apps.data.data || []);
      setError("");
    }).catch(() => setError("Unable to load analytics. Check that the local API is running."))
      .finally(() => setLoading(false));
  }, [custom, range]);

  const exportReport = () => {
    if (!data) return;
    const rows = [["Metric", "Value"], ["Total Decisions", data.totalDecisions], ["Approval Rate", formatPercent(data.approvalRate)], ["Review Rate", formatPercent(data.reviewRate)], ["High Risk Rate", formatPercent(data.highRiskRate)], ["Average Confidence", formatPercent(data.averageConfidence)]];
    const blob = new Blob([rows.map((row) => row.join(",")).join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dest-analytics-${range}-days.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const maxVolume = Math.max(...(data?.volume || []).map((item) => item.count), 1);
  const total = data?.totalDecisions || 0;
  const riskTotal = (data?.byRisk || []).reduce((sum, item) => sum + item.count, 0);
  const confidenceBars = useMemo(() => (data?.confidence || []).filter((item) => item._id !== "unknown"), [data]);

  return <main className="dashboard-shell"><WorkspaceSidebar /><section className="dashboard-main-panel analytics-page">
    <header className="decisions-page-header"><div><p className="eyebrow">DECISION INTELLIGENCE</p><h1>Analytics</h1><p className="dashboard-subtitle">Understand decision patterns, risk, confidence and review activity.</p></div><div className="analytics-header-actions"><select value={range} onChange={(event) => setRange(event.target.value)} aria-label="Date range"><option value="0">Today</option><option value="7">7 Days</option><option value="30">30 Days</option><option value="90">90 Days</option><option value="custom">Custom</option></select>{range === "custom" && <><input aria-label="Custom start date" type="date" value={custom.from} onChange={(event) => setCustom({ ...custom, from: event.target.value })} /><input aria-label="Custom end date" type="date" value={custom.to} onChange={(event) => setCustom({ ...custom, to: event.target.value })} /></>}<button className="primary-button action-accent" type="button" onClick={exportReport} disabled={!data}>Export Report</button></div></header>
    {error && <div className="error-message">{error}</div>}
    {loading ? <div className="dashboard-empty">Loading analytics...</div> : <><div className="analytics-stat-grid">{[["Total Decisions", total, "records"], ["Approval Rate", formatPercent(data.approvalRate), "completed outcomes"], ["Review Rate", formatPercent(data.reviewRate), "flagged or reviewed"], ["High Risk Rate", formatPercent(data.highRiskRate), "high and critical"], ["Average Confidence", formatPercent(data.averageConfidence), "model confidence"], ["Average Processing Time", formatDuration(data.averageProcessingMs), "decision latency"]].map(([label, value, detail]) => <div className="decision-stat" key={label}><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>)}</div><div className="analytics-grid"><ChartCard title="Decision Volume Over Time" eyebrow="THROUGHPUT"><div className="volume-chart">{data.volume?.length ? data.volume.map((item) => <div className="volume-bar-group" key={item._id}><i style={{ height: `${Math.max(8, item.count / maxVolume * 100)}%` }} title={`${item.count} decisions`} /><small>{item._id.slice(5)}</small></div>) : <EmptyChart />}</div></ChartCard><ChartCard title="Decision Outcome Distribution" eyebrow="OUTCOMES"><Donut items={data.outcomes} total={total} colors={["#00c2ae", "#ef4444", "#f59e0b", "#10b981"]} /></ChartCard><ChartCard title="Risk Distribution" eyebrow="RISK POSTURE"><div className="analytics-bars">{["low", "medium", "high", "critical"].map((risk) => { const count = data.byRisk?.find((item) => item._id === risk)?.count || 0; return <div key={risk}><span>{capitalize(risk)}</span><div><i style={{ width: `${riskTotal ? count / riskTotal * 100 : 0}%` }} /></div><b>{count}</b></div>; })}</div></ChartCard><ChartCard title="Confidence Distribution" eyebrow="MODEL QUALITY"><div className="confidence-chart">{confidenceBars.map((item) => <div key={item._id}><i style={{ height: `${total ? item.count / total * 1000 : 0}%` }} /><small>{confidenceLabel(item._id)}</small></div>)}</div></ChartCard><ChartCard title="Human Review Analytics" eyebrow="OVERSIGHT"><div className="review-analytics">{["pending", "approved", "rejected", "modified"].map((status) => <div key={status}><strong>{data.reviewStats?.find((item) => item._id === status)?.count || 0}</strong><span>{capitalize(status)}</span></div>)}</div></ChartCard><ChartCard title="Decision Processing Time" eyebrow="LATENCY"><div className="latency-value">{formatDuration(data.averageProcessingMs)}<small>average processing duration</small></div><p className="analytics-note">Measured from decision start to completion for records with timing data.</p></ChartCard><ChartCard title="Application Comparison" eyebrow="CONNECTED SYSTEMS" wide><div className="decision-table-wrapper"><table className="decision-table"><thead><tr><th>Application</th><th>Volume</th><th>High Risk</th><th>Confidence</th><th>Review Rate</th></tr></thead><tbody>{applications.length ? applications.map((item) => <tr key={item._id}><td>{item.name}</td><td>{item.decisions}</td><td>{item.highRisk}</td><td>{formatPercent(item.averageConfidence)}</td><td>{formatPercent(item.decisions ? item.reviews / item.decisions : 0)}</td></tr>) : <tr><td colSpan="5">No application data for this period.</td></tr>}</tbody></table></div></ChartCard></div></>}
  </section></main>;
}

function ChartCard({ title, eyebrow, children, wide = false }) { return <section className={`detail-card analytics-card ${wide ? "analytics-wide" : ""}`}><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{children}</section>; }
function Donut({ items = [], total, colors }) { return <div className="donut-layout"><div className="donut-chart" style={{ background: `conic-gradient(${items.map((item, index) => `${colors[index % colors.length]} ${(items.slice(0, index).reduce((sum, current) => sum + current.count, 0) / (total || 1)) * 100}% ${items.slice(0, index + 1).reduce((sum, current) => sum + current.count, 0) / (total || 1) * 100}%`).join(", ") || "#e2e8f0 0 100%"}` }}><span>{total}</span></div><div className="donut-legend">{items.map((item, index) => <span key={item._id}><i style={{ background: colors[index % colors.length] }} />{capitalize(item._id || "Unknown")} <b>{item.count}</b></span>)}</div></div>; }
function EmptyChart() { return <div className="empty-chart">No decision activity in this period.</div>; }
function formatPercent(value) { return value == null ? "—" : `${Math.round(value * 100)}%`; }
function formatDuration(value) { return value == null ? "—" : value < 1000 ? `${Math.round(value)} ms` : `${(value / 1000).toFixed(1)} s`; }
function confidenceLabel(value) { return value === 0 ? "0–20" : `${value * 100}–${value * 100 + 20}`; }
function capitalize(value) { return String(value || "").replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
export default Analytics;
