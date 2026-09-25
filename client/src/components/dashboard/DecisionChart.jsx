function DecisionChart({
  data = [],
}) {
  const maxValue = Math.max(
    ...data.map((item) =>
      Number(item.value || 0)
    ),
    1
  );

  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <div>
          <h3>Decision Activity</h3>
          <p>Decision volume over time</p>
        </div>
      </div>

      <div className="simple-bar-chart">
        {data.length === 0 ? (
          <div className="empty-state">
            No decision data available.
          </div>
        ) : (
          data.map((item, index) => {
            const value = Number(
              item.value || 0
            );

            const height =
              (value / maxValue) * 100;

            return (
              <div
                className="chart-bar-item"
                key={
                  item.id ||
                  item.label ||
                  index
                }
              >
                <div className="chart-bar-wrapper">
                  <div
                    className="chart-bar"
                    style={{
                      height: `${Math.max(
                        height,
                        5
                      )}%`,
                    }}
                    title={`${value}`}
                  ></div>
                </div>

                <span>
                  {item.label}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default DecisionChart;