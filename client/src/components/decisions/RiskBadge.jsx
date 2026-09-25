function RiskBadge({
  risk = "Low",
}) {
  const normalizedRisk =
    String(risk)
      .toLowerCase()
      .replace(/\s+/g, "-");

  return (
    <span
      className={`risk-badge risk-${normalizedRisk}`}
    >
      {risk}
    </span>
  );
}

export default RiskBadge;