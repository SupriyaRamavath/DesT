function ReplayControls({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onPlay,
  isPlaying,
}) {
  return (
    <div className="replay-controls">
      <button
        type="button"
        onClick={onPrevious}
        disabled={currentStep <= 0}
      >
        ← Previous
      </button>

      <button
        type="button"
        className="primary-button"
        onClick={onPlay}
      >
        {isPlaying ? "Pause" : "Play"}
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={
          currentStep >= totalSteps - 1
        }
      >
        Next →
      </button>

      <span className="replay-counter">
        Step {totalSteps === 0
          ? 0
          : currentStep + 1}{" "}
        of {totalSteps}
      </span>
    </div>
  );
}

export default ReplayControls;