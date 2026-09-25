function ReplayStep({
  event,
  index,
  active,
  completed,
  onClick,
}) {
  return (
    <button
      type="button"
      className={`replay-step ${
        active ? "active" : ""
      } ${completed ? "completed" : ""}`}
      onClick={onClick}
    >
      <span className="replay-step-number">
        {index + 1}
      </span>

      <span className="replay-step-content">
        <strong>
          {event?.title ||
            event?.name ||
            event?.eventType ||
            "Replay Step"}
        </strong>

        <small>
          {event?.description ||
            "No description available."}
        </small>
      </span>
    </button>
  );
}

export default ReplayStep;