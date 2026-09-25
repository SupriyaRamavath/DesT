import ReplayStep from "./ReplayStep";

function ReplayTimeline({
  events = [],
  currentStep = 0,
  onStepClick,
}) {
  return (
    <div className="replay-timeline">
      {events.length === 0 ? (
        <div className="empty-state">
          No replay events available.
        </div>
      ) : (
        events.map((event, index) => (
          <ReplayStep
            key={
              event._id ||
              event.id ||
              index
            }
            event={event}
            index={index}
            active={
              index === currentStep
            }
            completed={
              index < currentStep
            }
            onClick={() =>
              onStepClick?.(index)
            }
          />
        ))
      )}
    </div>
  );
}

export default ReplayTimeline;