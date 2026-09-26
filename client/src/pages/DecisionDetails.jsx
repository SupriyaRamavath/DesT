import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import api from "../services/api";

function DecisionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [decision, setDecision] = useState(null);
  const [replay, setReplay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([api.get(`/decisions/${id}`), api.get(`/decisions/${id}/replay`)])
      .then(([decisionResponse, replayResponse]) => {
        if (!active) return;
        setDecision(decisionResponse.data.data);
        setReplay(replayResponse.data.data || {});
      })
      .catch(() => {
        if (active) setError("Decision not found. Return to Decisions and select an existing record.");
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id]);

  if (loading) return <main className="dashboard-main-panel"><div className="dashboard-empty">Loading decision details...</div></main>;
  if (error || !decision) return <main className="dashboard-main-panel"><div className="detail-back"><Link to="/decisions">← Back to Decisions</Link></div><div className="dashboard-empty"><strong>{error || "Decision not found."}</strong></div></main>;
  const item = decision;
  const confidence = item.confidence == null ? "—" : `${Math.round(item.confidence * 100)}%`;
  const events = replay?.events || [];
  const reviews = replay?.reviews || [];

  return <main className="dashboard-main-panel detail-page">
    <div className="detail-back"><Link to="/decisions">← Back to Decisions</Link></div>
    <header className="detail-header"><div><p className="eyebrow">DECISION RECORD</p><h1>Decision Details</h1><p className="dashboard-subtitle">{item.title || item.externalDecisionId}</p></div><div className="detail-actions"><button className="secondary-button" onClick={() => navigate(`/decisions/${id}/replay`)} type="button">▶ Replay Decision</button><button className="primary-button" type="button">Flag for Review</button></div></header>
    <section className="decision-summary-hero"><div><span className="detail-id">{item.externalDecisionId || id}</span><h2>{item.output?.decision ? resultLabel(item.output.decision) : "Pending"}</h2><p>{item.application?.name || "Unknown application"} · Created {formatDate(item.createdAt)}</p></div><div className="hero-metrics"><Metric label="Confidence" value={confidence} /><Metric label="Risk" value={capitalize(item.riskLevel)} tone={item.riskLevel} /><Metric label="Status" value={capitalize(item.status)} /></div></section>
    <div className="detail-grid">
      <section className="detail-card detail-wide"><CardHeading title="Decision Summary" /><div className="detail-field-grid"><Field label="Input" value={item.inputSummary || stringify(item.input)} /><Field label="AI output" value={stringify(item.output)} /><Field label="Final result" value={resultLabel(item.output?.decision)} /><Field label="Confidence score" value={confidence} /><Field label="Risk level" value={capitalize(item.riskLevel)} /><Field label="Processing time" value={processingTime(item)} /><Field label="Model information" value={stringify(item.model) || "Model metadata not recorded"} /></div></section>
      <section className="detail-card"><CardHeading title="Evidence Summary" /><div className="detail-number">{replay?.evidence?.length || 0}</div><p className="muted">Evidence records attached</p><div className="detail-list"><span>Sources <b>{replay?.evidence?.map((e) => e.source).join(", ") || "No sources recorded"}</b></span><span>Reliability <b>Not assessed</b></span><span>Contribution <b>Available in replay</b></span></div></section>
      <section className="detail-card detail-wide"><CardHeading title="Decision Flow" /><div className="flow-row">{["Input", "Processing", "Evidence", "Analysis", "Confidence", "Risk", "Decision", "Human Review", "Final Outcome"].map((stage, index) => <div className={`flow-stage ${index < (events.length || 4) ? "completed" : index === (events.length || 4) ? "current" : ""}`} key={stage}><span>{index + 1}</span><b>{stage}</b></div>)}</div></section>
      <section className="detail-card"><CardHeading title="Risk Analysis" /><Metric label="Risk level" value={capitalize(item.riskLevel)} tone={item.riskLevel} /><div className="detail-list"><span>Indicators <b>{item.riskFlags?.join(", ") || "No indicators recorded"}</b></span><span>Explanation <b>{item.output?.reason || "Risk assessment is based on the recorded trace."}</b></span></div></section>
      <section className="detail-card"><CardHeading title="Human Review" /><div className="detail-list"><span>Status <b>{reviews.length ? "Reviewed" : item.status === "flagged" ? "Pending" : "Not required"}</b></span><span>Reviewer <b>{reviews[0]?.reviewer?.name || "Unassigned"}</b></span><span>Comments <b>{reviews[0]?.comment || "No comments recorded"}</b></span><span>Timestamp <b>{reviews[0]?.reviewedAt ? formatDate(reviews[0].reviewedAt) : "—"}</b></span></div></section>
      <section className="detail-card detail-wide"><CardHeading title="Audit Information" /><div className="detail-field-grid audit-grid"><Field label="Created by" value={item.createdBy?.name || "Application owner"} /><Field label="Updated by" value="Not recorded" /><Field label="Number of events" value={events.length} /><Field label="Number of audit records" value={replay?.audit?.length || 0} /></div></section>
    </div>
  </main>;
}

function CardHeading({ title }) { return <div className="detail-card-heading"><p className="eyebrow">{title.toUpperCase()}</p><h2>{title}</h2></div>; }
function Metric({ label, value, tone = "" }) { return <div className="detail-metric"><span>{label}</span><strong className={tone}>{value}</strong></div>; }
function Field({ label, value }) { return <div className="detail-field"><span>{label}</span><strong>{value}</strong></div>; }
function stringify(value) { if (!value) return "Not recorded"; return typeof value === "string" ? value : JSON.stringify(value); }
function processingTime(item) { if (!item.startedAt || !item.completedAt) return "Not recorded"; return `${Math.max(0, new Date(item.completedAt) - new Date(item.startedAt))} ms`; }
function formatDate(value) { return value ? new Date(value).toLocaleString() : "Not recorded"; }
function resultLabel(value) { return { human_review: "Review Required", approved: "Approved", rejected: "Rejected", qualified: "Qualified", not_qualified: "Not Qualified" }[value] || capitalize(value || "Pending"); }
function capitalize(value) { return String(value || "").replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
export default DecisionDetails;
