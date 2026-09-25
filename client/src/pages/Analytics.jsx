import { useState } from "react";
import { Link, useParams } from "react-router";

function ReviewDetails() {

  const { id } = useParams();

  const [comment, setComment] = useState("");

  const submitReview = (status) => {

    if (!comment.trim()) {
      alert("Please add a review comment.");
      return;
    }

    alert(`Decision ${status.toLowerCase()} successfully.`);
  };

  return (
    <div>

      <div className="breadcrumb">
        <Link to="/reviews">Reviews</Link>
        <span>/</span>
        <span>{id}</span>
      </div>

      <div className="page-header">

        <div>
          <h1>Review {id}</h1>
          <p>Human review and decision verification.</p>
        </div>

      </div>

      <div className="detail-grid">

        <div className="panel">

          <h2>Flagged Decision</h2>

          <div className="detail-list">

            <div>
              <span>Decision</span>
              <strong>DEC-1002</strong>
            </div>

            <div>
              <span>Application</span>
              <strong>Loan Assessment AI</strong>
            </div>

            <div>
              <span>AI Result</span>
              <strong>Review Required</strong>
            </div>

            <div>
              <span>Confidence</span>
              <strong>71%</strong>
            </div>

            <div>
              <span>Risk</span>
              <span className="badge high">
                High
              </span>
            </div>

          </div>

        </div>

        <div className="panel">

          <h2>Reviewer Action</h2>

          <div className="form-group">

            <label>Review Comment</label>

            <textarea
              rows="7"
              placeholder="Explain your review decision..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

          </div>

          <div className="review-actions">

            <button
              className="danger-button"
              onClick={() => submitReview("Rejected")}
            >
              Reject
            </button>

            <button
              className="primary-button"
              onClick={() => submitReview("Approved")}
            >
              Approve
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default ReviewDetails;