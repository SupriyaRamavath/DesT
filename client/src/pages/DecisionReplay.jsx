import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router";
import api from "../services/api";

const stages = ["INPUT", "PROCESSING", "EVIDENCE", "ANALYSIS", "CONFIDENCE", "RISK", "DECISION", "HUMAN REVIEW", "FINAL OUTCOME"];

function DecisionReplay() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api.get(`/decisions/${id}/replay`).then((response) => active && setData(response.data.data)).catch(() => active && setError("Replay data could not be loaded. Return to Decisions and select an existing record.")).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);

  const events = data?.events || [];
  const event = events[current];
  const complete = current === events.length - 1;

  useEffect(() => {
    if (!playing) return undefined;
    const timer = window.setInterval(() => setCurrent((value) => {
      if (value >= events.length - 1) { setPlaying(false); return value; }
      return value + 1;
    }), 1800 / speed);
    return () => window.clearInterval(timer);
  }, [events.length, playing, speed]);

  const progress = useMemo(() => Math.round(((current + 1) / events.length) * 100), [current, events.length]);
  if (loading) return <main className="dashboard-main-panel"><div className="dashboard-empty">Loading decision replay...</div></main>;
  if (error || !data) return <main className="dashboard-main-panel"><div className="detail-back"><Link to="/decisions">← Back to Decisions</Link></div><div className="dashboard-empty"><strong>{error || "Replay not found."}</strong></div></main>;
  if (!events.length) return <main className="dashboard-main-panel"><div className="detail-back"><Link to={`/decisions/${id}`}>← Back to Decision</Link></div><div className="dashboard-empty"><strong>No replay events have been recorded.</strong><p>Ingest events for this decision before starting replay.</p></div></main>;
  const decision = data?.decision || {};

  return <main className="dashboard-main-panel replay-page">
    <div className="detail-back"><Link to={`/decisions/${id}`}>← Back to Decision</Link></div>
    <header className="detail-header"><div><p className="eyebrow">FORENSIC RECONSTRUCTION</p><h1>Decision Replay</h1><p className="dashboard-subtitle">Reconstruct the decision from input to final outcome.</p></div><span className="replay-status">{complete ? "● Replay Complete" : "● Replay Ready"}</span></header>
    <section className="replay-meta"><div><span>Decision ID</span><strong>{decision.externalDecisionId || id}</strong></div><div><span>Application</span><strong>{decision.application?.name || "Unknown application"}</strong></div><div><span>Final decision</span><strong>{resultLabel(decision.output?.decision)}</strong></div><div><span>Confidence</span><strong>{decision.confidence == null ? "—" : `${Math.round(decision.confidence * 100)}%`}</strong></div><div><span>Risk</span><strong className={decision.riskLevel}>{capitalize(decision.riskLevel)}</strong></div></section>
    <div className="replay-layout"><section className="replay-timeline-card"><div className="replay-progress"><span>Progress</span><b>{progress}%</b><div><i style={{ width: `${progress}%` }} /></div></div><div className="forensic-timeline">{events.map((item, index) => <button type="button" className={`forensic-step ${index === current ? "active" : ""} ${index < current ? "completed" : ""}`} onClick={() => setCurrent(index)} key={item._id || index}><span className="forensic-number">{index < current ? "✓" : index + 1}</span><div><strong>{item.type || stages[index]}</strong><span>{item.name || `Stage ${index + 1}`}</span><small>{formatDate(item.timestamp)} · {item.durationMs ? `${item.durationMs} ms` : "—"}</small></div></button>)}</div></section><aside className="event-details-card"><p className="eyebrow">EVENT DETAILS</p><h2>{event.name || event.type}</h2><span className="event-type">{event.type}</span><div className="event-detail-list"><span>Event ID <b>{event._id || "—"}</b></span><span>Timestamp <b>{formatDate(event.timestamp)}</b></span><span>Duration <b>{event.durationMs ? `${event.durationMs} ms` : "—"}</b></span><span>Description <b>{event.description || "No description recorded."}</b></span><span>Input / output <b>{stringify(event.data)}</b></span><span>Evidence references <b>{data?.evidence?.length || 0} attached records</b></span><span>Confidence <b>{decision.confidence == null ? "—" : `${Math.round(decision.confidence * 100)}%`}</b></span><span>Risk <b>{capitalize(decision.riskLevel)}</b></span></div></aside></div>
    <section className="replay-controls-card"><button className="secondary-button" disabled={current === 0} onClick={() => setCurrent((value) => value - 1)} type="button">← Previous</button><button className="primary-button" onClick={() => setPlaying((value) => !value)} type="button">{playing ? "Ⅱ Pause" : "▶ Play"}</button><button className="secondary-button" disabled={complete} onClick={() => setCurrent((value) => value + 1)} type="button">Next →</button><button className="secondary-button" onClick={() => setCurrent(0)} type="button">↺ Restart</button><label>Speed <select value={speed} onChange={(event) => setSpeed(Number(event.target.value))}><option value="0.5">0.5x</option><option value="1">1x</option><option value="2">2x</option></select></label></section>
    <div className="replay-footer-actions"><Link to={`/decisions/${id}`}>Back to Decision</Link><button type="button">View Evidence</button><button type="button">View Audit Trail</button><button type="button">Request Human Review</button></div>
  </main>;
}

function stringify(value) { if (!value) return "Not recorded"; return typeof value === "string" ? value : JSON.stringify(value); }
function formatDate(value) { return value ? new Date(value).toLocaleString() : "Not recorded"; }
function resultLabel(value) { return { human_review: "Review Required", approved: "Approved", rejected: "Rejected" }[value] || capitalize(value || "Pending"); }
function capitalize(value) { return String(value || "").replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
export default DecisionReplay;
