import { Link } from "react-router";

function Dashboard() {

  const stats = [
    {
      title: "Total Decisions",
      value: "1,284",
      change: "+12.4%",
      icon: "◈",
    },
    {
      title: "High Risk Decisions",
      value: "37",
      change: "+4.2%",
      icon: "⚠",
    },
    {
      title: "Pending Reviews",
      value: "18",
      change: "-8.1%",
      icon: "✓",
    },
    {
      title: "AI Applications",
      value: "12",
      change: "+2",
      icon: "▣",
    },
  ];

  const recentDecisions = [
    {
      id: "DEC-1001",
      application: "Resume Screening AI",
      result: "Qualified",
      risk: "Low",
      time: "2 minutes ago",
    },
    {
      id: "DEC-1002",
      application: "Loan Assessment AI",
      result: "Review Required",
      risk: "High",
      time: "12 minutes ago",
    },
    {
      id: "DEC-1003",
      application: "Fraud Detection",
      result: "Approved",
      risk: "Medium",
      time: "28 minutes ago",
    },
    {
      id: "DEC-1004",
      application: "Resume Screening AI",
      result: "Rejected",
      risk: "Medium",
      time: "42 minutes ago",
    },
  ];

  return (
    <div>

      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>
            Monitor AI decisions, risks, and review activity.
          </p>
        </div>

        <Link
          to="/applications"
          className="primary-button"
        >
          + Add Application
        </Link>
      </div>

      <div className="stats-grid">

        {stats.map((stat) => (
          <div className="stat-card" key={stat.title}>

            <div className="stat-icon">
              {stat.icon}
            </div>

            <div>
              <p>{stat.title}</p>
              <h2>{stat.value}</h2>

              <span className="stat-change">
                {stat.change}
              </span>
            </div>

          </div>
        ))}

      </div>

      <div className="dashboard-grid">

        <div className="panel">

          <div className="panel-header">
            <div>
              <h2>Decision Activity</h2>
              <p>Decisions processed over the last 7 days.</p>
            </div>

            <select>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>

          <div className="chart-placeholder">

            <div className="chart-bars">

              {[45, 70, 55, 85, 65, 95, 78].map(
                (height, index) => (
                  <div
                    key={index}
                    className="chart-bar"
                    style={{ height: `${height}%` }}
                  ></div>
                )
              )}

            </div>

            <div className="chart-labels">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>

          </div>

        </div>

        <div className="panel">

          <div className="panel-header">
            <div>
              <h2>Risk Distribution</h2>
              <p>Current decision risk levels.</p>
            </div>
          </div>

          <div className="risk-chart">

            <div className="risk-item">
              <span>Low</span>
              <strong>72%</strong>
              <div className="progress">
                <div
                  className="progress-fill low"
                  style={{ width: "72%" }}
                ></div>
              </div>
            </div>

            <div className="risk-item">
              <span>Medium</span>
              <strong>21%</strong>
              <div className="progress">
                <div
                  className="progress-fill medium"
                  style={{ width: "21%" }}
                ></div>
              </div>
            </div>

            <div className="risk-item">
              <span>High</span>
              <strong>7%</strong>
              <div className="progress">
                <div
                  className="progress-fill high"
                  style={{ width: "7%" }}
                ></div>
              </div>
            </div>

          </div>

        </div>

      </div>

      <div className="panel">

        <div className="panel-header">

          <div>
            <h2>Recent Decisions</h2>
            <p>Latest AI decisions captured by DecisionTrace.</p>
          </div>

          <Link to="/decisions">
            View all →
          </Link>

        </div>

        <div className="table-container">

          <table>

            <thead>
              <tr>
                <th>ID</th>
                <th>Application</th>
                <th>Result</th>
                <th>Risk</th>
                <th>Time</th>
                <th></th>
              </tr>
            </thead>

            <tbody>

              {recentDecisions.map((decision) => (

                <tr key={decision.id}>

                  <td>
                    <strong>{decision.id}</strong>
                  </td>

                  <td>{decision.application}</td>

                  <td>{decision.result}</td>

                  <td>
                    <span
                      className={`badge ${decision.risk.toLowerCase()}`}
                    >
                      {decision.risk}
                    </span>
                  </td>

                  <td>{decision.time}</td>

                  <td>
                    <Link
                      to={`/decisions/${decision.id}`}
                      className="table-link"
                    >
                      View
                    </Link>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default Dashboard;