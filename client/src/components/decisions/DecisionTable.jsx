import { Link } from "react-router";
import DecisionStatus from "./DecisionStatus";
import RiskBadge from "./RiskBadge";
import formatDate from "../../utils/formatDate";
import {
  formatConfidence,
} from "../../utils/formatConfidence";

function DecisionTable({
  decisions = [],
}) {
  if (decisions.length === 0) {
    return (
      <div className="empty-state">
        No decisions found.
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Decision</th>
            <th>Application</th>
            <th>Result</th>
            <th>Confidence</th>
            <th>Risk</th>
            <th>Status</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {decisions.map((decision) => {
            const id =
              decision._id ||
              decision.id;

            return (
              <tr key={id}>
                <td>
                  <strong>
                    {decision.decisionId ||
                      id}
                  </strong>
                </td>

                <td>
                  {decision.applicationName ||
                    decision.application?.name ||
                    "—"}
                </td>

                <td>
                  {decision.result || "—"}
                </td>

                <td>
                  {formatConfidence(
                    decision.confidence
                  )}
                </td>

                <td>
                  <RiskBadge
                    risk={
                      decision.riskLevel
                    }
                  />
                </td>

                <td>
                  <DecisionStatus
                    status={
                      decision.status
                    }
                  />
                </td>

                <td>
                  {formatDate(
                    decision.createdAt
                  )}
                </td>

                <td>
                  <Link
                    to={`/decisions/${id}`}
                    className="table-action"
                  >
                    View
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default DecisionTable;