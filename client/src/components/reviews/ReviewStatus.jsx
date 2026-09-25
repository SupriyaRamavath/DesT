function ReviewStatus({
  status = "Pending",
}) {
  const normalizedStatus =
    String(status)
      .toLowerCase()
      .replace(/\s+/g, "-");

  return (
    <span
      className={`review-status review-${normalizedStatus}`}
    >
      {status}
    </span>
  );
}

export default ReviewStatus;