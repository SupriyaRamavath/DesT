function EvidencePanel({
  evidence = [],
}) {
  return (
    <div className="evidence-panel">
      <div className="section-header">
        <div>
          <h3>Evidence</h3>
          <p>
            Information supporting this
            decision
          </p>
        </div>
      </div>

      {evidence.length === 0 ? (
        <div className="empty-state">
          No evidence attached.
        </div>
      ) : (
        <div className="evidence-list">
          {evidence.map((item, index) => (
            <div
              className="evidence-item"
              key={
                item._id ||
                item.id ||
                index
              }
            >
              <div className="evidence-icon">
                E
              </div>

              <div className="evidence-content">
                <strong>
                  {item.title ||
                    item.name ||
                    `Evidence ${index + 1}`}
                </strong>

                <p>
                  {item.description ||
                    item.content ||
                    "No description available."}
                </p>

                {item.source && (
                  <small>
                    Source: {item.source}
                  </small>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default EvidencePanel;