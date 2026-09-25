function Notifications() {

  const notifications = [
    {
      title: "High-risk decision detected",
      description:
        "DEC-1002 requires human review.",
      time: "5 minutes ago",
      type: "warning",
    },
    {
      title: "Application connected",
      description:
        "Fraud Detection has successfully connected to DecisionTrace.",
      time: "1 hour ago",
      type: "success",
    },
    {
      title: "Review completed",
      description:
        "REV-002 was approved by Arjun.",
      time: "3 hours ago",
      type: "info",
    },
  ];

  return (
    <div>

      <div className="page-header">

        <div>
          <h1>Notifications</h1>
          <p>
            Stay updated about important DecisionTrace activity.
          </p>
        </div>

        <button className="secondary-button">
          Mark all as read
        </button>

      </div>

      <div className="notification-list">

        {notifications.map((notification, index) => (

          <div
            className="notification-card"
            key={index}
          >

            <div className={`notification-icon ${notification.type}`}>
              {notification.type === "warning"
                ? "⚠"
                : notification.type === "success"
                ? "✓"
                : "i"}
            </div>

            <div className="notification-content">

              <h3>{notification.title}</h3>

              <p>{notification.description}</p>

              <small>{notification.time}</small>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

export default Notifications;