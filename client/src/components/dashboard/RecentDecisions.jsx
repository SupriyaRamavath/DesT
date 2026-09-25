function RiskChart({
  data = [],
}) {
  const total = data.reduce(
    (sum, item) =>
      sum + Number(item.value || 0),
    0
  );

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div>
          <h3>Risk Distribution</h3>
          <p>Decisions grouped by risk level</p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="empty-state">
          No risk data available.
        </div>
      ) : (
        <div className="risk-chart-list">
          {data.map((item, index) => {
            const value = Number(
              item.value || 0
            );

            const percentage =
              total > 0
                ? (value / total) * 100
                : 0;

            return (
              <div
                className="risk-chart-item"
                key={
                  item.id ||
                  item.label ||
                  index
                }
              >
                <div className="risk-chart-header">
                  <span>
                    {item.label}
                  </span>

                  <strong>
                    {value}
                  </strong>
                </div>

                <div className="risk-progress">
                  <div
                    className="risk-progress-fill"
                    style={{
                      width: `${percentage}%`,
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RiskChart;