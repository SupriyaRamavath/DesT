import { Link } from "react-router";
import ReviewStatus from "./ReviewStatus";
import formatDate from "../../utils/formatDate";

function ReviewCard({
  review,
}) {
  if (!review) {
    return null;
  }

  const id =
    review._id ||
    review.id;

  const decisionId =
    review.decision?._id ||
    review.decision?.id ||
    review.decisionId;

  return (
    <div className="review-card">
      <div className="review-card-header">
        <div>
          <span>
            {review.reviewId || id}
          </span>

          <h3>
            {review.title ||
              "Decision Review"}
          </h3>
        </div>

        <ReviewStatus
          status={review.status}
        />
      </div>

      <div className="review-card-body">
        <div>
          <span>Decision</span>

          <strong>
            {decisionId || "—"}
          </strong>
        </div>

        <div>
          <span>Reviewer</span>

          <strong>
            {review.reviewer?.name ||
              review.reviewerName ||
              "Unassigned"}
          </strong>
        </div>

        <div>
          <span>Created</span>

          <strong>
            {formatDate(
              review.createdAt
            )}
          </strong>
        </div>

        <div>
          <span>Comment</span>

          <strong>
            {review.comment ||
              "No comment"}
          </strong>
        </div>
      </div>

      <div className="review-card-footer">
        <Link
          to={`/reviews/${id}`}
          className="secondary-button"
        >
          Review Details
        </Link>
      </div>
    </div>
  );
}

export default ReviewCard;