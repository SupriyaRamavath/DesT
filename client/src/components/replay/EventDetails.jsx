import formatDate from "../../utils/formatDate";

function EventDetails({
  event,
}) {
  if (!event) {
    return (
      <div className="empty-state">
        Select a replay event.
      </div>
    );
  }

  return (
    <div className="event-details">
      <div className="event-details-header">
        <span className="event-type">
          {event.eventType ||
            "EVENT"}
        </span>

        <h3>
          {event.title ||
            event.name ||
            "Event Details"}
        </h3>
      </div>

      <div className="event-details-grid">
        <div>
          <span>Event ID</span>
          <strong>
            {event._id ||
              event.id ||
              "—"}
          </strong>
        </div>

        <div>
          <span>Timestamp</span>
          <strong>
            {formatDate(
              event.createdAt ||
                event.timestamp
            )}
          </strong>
        </div>

        <div>
          <span>Type</span>
          <strong>
            {event.eventType ||
              "—"}
          </strong>
        </div>

        <div>
          <span>Status</span>
          <strong>
            {event.status || "—"}
          </strong>
        </div>
      </div>

      <div className="event-description">
        <h4>Description</h4>

        <p>
          {event.description ||
            "No description available."}
        </p>
      </div>

      {event.data && (
        <div className="event-data">
          <h4>Event Data</h4>

          <pre>
            {JSON.stringify(
              event.data,
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
}

export default EventDetails;