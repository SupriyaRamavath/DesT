function DecisionStatus({
  status = "Pending",
}) {
  const normalizedStatus =
    String(status)
      .toLowerCase()
      .replace(/\s+/g, "-");

  return (
    <span
      className={`decision-status status-${normalizedStatus}`}
    >
      {status}
    </span>
  );
}

export default DecisionStatus;