function AuditLogs() {

  const logs = [
    {
      id: "LOG-1001",
      user: "Supriya Bai",
      action: "Decision reviewed",
      resource: "DEC-1002",
      time: "2 minutes ago",
      type: "Review",
    },
    {
      id: "LOG-1002",
      user: "System",
      action: "Decision ingested",
      resource: "DEC-1005",
      time: "8 minutes ago",
      type: "System",
    },
    {
      id: "LOG-1003",
      user: "Arjun",
      action: "Application updated",
      resource: "APP-002",
      time: "31 minutes ago",
      type: "Update",
    },
    {
      id: "LOG-1004",
      user: "Supriya Bai",
      action: "Logged in",
      resource: "USER",
      time: "1 hour ago",
      type: "Authentication",
    },
  ];

  return (
    <div>

      <div className="page-header">

        <div>
          <h1>Audit Logs</h1>
          <p>
            Complete activity history for DecisionTrace.
          </p>
        </div>

      </div>

      <div className="panel">

        <div className="filter-panel">

          <input placeholder="Search audit logs..." />

          <select>
            <option>All actions</option>
            <option>Authentication</option>
            <option>Review</option>
            <option>Update</option>
            <option>System</option>
          </select>

        </div>

        <div className="table-container">

          <table>

            <thead>
              <tr>
                <th>Log ID</th>
                <th>User</th>
                <th>Action</th>
                <th>Resource</th>
                <th>Type</th>
                <th>Time</th>
              </tr>
            </thead>

            <tbody>

              {logs.map((log) => (

                <tr key={log.id}>

                  <td>
                    <strong>{log.id}</strong>
                  </td>

                  <td>{log.user}</td>

                  <td>{log.action}</td>

                  <td>{log.resource}</td>

                  <td>
                    <span className="badge neutral">
                      {log.type}
                    </span>
                  </td>

                  <td>{log.time}</td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default AuditLogs;