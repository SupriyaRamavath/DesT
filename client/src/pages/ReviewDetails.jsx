import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import api from "../services/api";
import WorkspaceSidebar from "../components/common/WorkspaceSidebar";

function ReviewDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [review, setReview] = useState(null);
  const [action, setAction] = useState("approve");
  const [comment, setComment] = useState("");
  const [modifiedOutput, setModifiedOutput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/reviews/${id}`).then((response) => setReview(response.data.data)).catch((requestError) => setError(requestError.response?.data?.message || "Review not found."));
  }, [id]);

  const submit = async (draft = false) => {
    if (!draft && action !== "approve" && !comment.trim()) {
      setError("Comments are required when rejecting or modifying a decision.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.patch(`/reviews/${id}`, {
        action: draft ? "request_more_information" : action,
        comment: comment.trim() || (draft ? "Review saved as draft." : ""),
        ...(action === "modify" ? { modifiedOutput: modifiedOutput.trim() } : {}),
      });
      navigate("/reviews");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to submit review.");
    } finally {
      setSaving(false);
    }
  };

  if (error && !review) return <Shell><div className="dashboard-empty"><strong>{error}</strong><Link className="detail-back" to="/reviews">← Back to Reviews</Link></div></Shell>;
  if (!review) return <Shell><div className="dashboard-empty">Loading review...</div></Shell>;
  const decision = review.decision || {};
  return <Shell><div className="detail-back"><Link to="/reviews">← Back to Reviews</Link></div><header className="detail-header"><div><p className="eyebrow">HUMAN-IN-THE-LOOP</p><h1>Human Review</h1><p className="dashboard-subtitle">Evaluate this AI decision and record an accountable human outcome.</p></div><span className={`review-status ${review.status}`}>{capitalize(review.status)}</span></header>{error && <div className="error-message">{error}</div>}<div className="review-detail-meta"><span><b>Review ID</b>{shortId(review._id)}</span><span><b>Decision ID</b>{decision.externalDecisionId || "—"}</span><span><b>Application</b>{decision.application?.name || "—"}</span><span><b>Risk</b><em className={`risk-pill ${decision.riskLevel}`}>{capitalize(decision.riskLevel)}</em></span><span><b>Confidence</b>{decision.confidence == null ? "—" : `${Math.round(decision.confidence * 100)}%`}</span></div><div className="review-detail-grid"><section className="detail-card"><CardHeading title="Decision Information" /><div className="review-block"><label>Original input</label><pre>{formatValue(decision.input || decision.inputSummary)}</pre></div><div className="review-block"><label>AI output</label><pre>{formatValue(decision.output)}</pre></div><div className="review-block"><label>AI decision</label><strong>{resultLabel(decision.output?.decision)}</strong></div><div className="review-block"><label>Evidence summary</label><p>Evidence references are available from the decision audit trail.</p></div></section><section className="detail-card"><CardHeading title="Decision Trace" /><div className="review-trace">{["Input", "Processing", "Evidence", "Analysis", "Decision"].map((step, index) => <div className="review-trace-step" key={step}><span>{index + 1}</span><strong>{step}</strong>{index < 4 && <i>→</i>}</div>)}</div><p className="review-trace-note">Inspect the full event-by-event reconstruction from the Decision Replay page.</p><Link className="secondary-button" to={`/decisions/${decision._id}/replay`}>View Decision Replay</Link></section><aside className="detail-card review-panel"><CardHeading title="Review Panel" /><label className="review-field-label">Reviewer decision<select value={action} onChange={(event) => setAction(event.target.value)}><option value="approve">Approve</option><option value="reject">Reject</option><option value="modify">Modify</option></select></label>{action === "modify" && <label className="review-field-label">Modified decision<textarea placeholder="Enter the modified decision..." value={modifiedOutput} onChange={(event) => setModifiedOutput(event.target.value)} /></label>}<label className="review-field-label">Comments<textarea placeholder="Enter your review comments..." value={comment} onChange={(event) => setComment(event.target.value)} /></label><div className="application-form-actions review-panel-actions"><button className="secondary-button" type="button" onClick={() => navigate("/reviews")}>Cancel</button><button className="secondary-button" type="button" disabled={saving} onClick={() => submit(true)}>Save Draft</button><button className="primary-button" type="button" disabled={saving} onClick={() => submit(false)}>{saving ? "Submitting..." : "Submit Review"}</button></div></aside><section className="detail-card detail-wide"><CardHeading title="Review History" /><div className="review-history"><div><strong>{capitalize(review.action)}</strong><span>{review.reviewer?.name || "Reviewer"} · {formatDate(review.createdAt)}</span></div><p>{review.comment || "No comments recorded."}</p></div></section></div></Shell>;
}

function Shell({ children }) { return <main className="dashboard-shell"><WorkspaceSidebar /><section className="dashboard-main-panel review-detail-page">{children}</section></main>; }
function CardHeading({ title }) { return <div className="detail-card-heading"><p className="eyebrow">{title.toUpperCase()}</p><h2>{title}</h2></div>; }
const capitalize = (value) => String(value || "").replace("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
const shortId = (value) => value ? `REV-${String(value).slice(-6).toUpperCase()}` : "—";
const formatDate = (value) => value ? new Date(value).toLocaleString() : "—";
const formatValue = (value) => typeof value === "string" ? value : JSON.stringify(value || {}, null, 2);
const resultLabel = (value) => ({ approved: "Approved", rejected: "Rejected", human_review: "Review Required" }[value] || capitalize(value || "Pending"));
export default ReviewDetails;
