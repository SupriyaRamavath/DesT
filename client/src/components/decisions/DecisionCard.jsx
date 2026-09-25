import { Link } from "react-router";
import DecisionStatus from "./DecisionStatus";
import RiskBadge from "./RiskBadge";
import formatDate from "../../utils/formatDate";
import {
  formatConfidence,
} from "../../utils/formatConfidence";

function DecisionCard({
  decision,
}) {
  if (!decision) {
    return null;
  }

  const decisionId =
    decision._id || decision.id;

  return (
    <div className="decision-card">
      <div className="decision-card-header">
        <div>
          <span className="decision-id">
            {decision.decisionId ||
              decisionId}
          </span>

          <h3>
            {decision.title ||
              decision.name ||
              "Untitled Decision"}
          </h3>
        </div>

        <DecisionStatus
          status={decision.status}
        />
      </div>

      <div className="decision-card-body">
        <div className="decision-detail">
          <span>Application</span>
          <strong>
            {decision.applicationName ||
              decision.application?.name ||
              "—"}
          </strong>
        </div>

        <div className="decision-detail">
          <span>Result</span>
          <strong>
            {decision.result || "—"}
          </strong>
        </div>

        <div className="decision-detail">
          <span>Confidence</span>
          <strong>
            {formatConfidence(
              decision.confidence
            )}
          </strong>
        </div>

        <div className="decision-detail">
          <span>Risk</span>
          <RiskBadge
            risk={decision.riskLevel}
          />
        </div>
      </div>

      <div className="decision-card-footer">
        <small>
          {formatDate(
            decision.createdAt
          )}
        </small>

        <Link
          to={`/decisions/${decisionId}`}
          className="secondary-button"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}

export default DecisionCard;