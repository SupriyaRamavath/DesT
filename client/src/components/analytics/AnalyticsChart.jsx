function AnalyticsCard({
  title,
  value,
  description,
  icon = "▥",
}) {
  return (
    <div className="analytics-card">
      <div className="analytics-card-icon">
        {icon}
      </div>

      <div className="analytics-card-content">
        <span>{title}</span>

        <h2>{value ?? "—"}</h2>

        {description && (
          <p>{description}</p>
        )}
      </div>
    </div>
  );
}

export default AnalyticsCard;