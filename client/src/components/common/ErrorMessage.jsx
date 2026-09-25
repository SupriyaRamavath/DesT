function ErrorMessage({
  message = "Something went wrong.",
  onRetry,
}) {
  return (
    <div className="error-message">
      <div className="error-icon">
        !
      </div>

      <div className="error-content">
        <h3>Unable to load data</h3>

        <p>{message}</p>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="primary-button"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorMessage;