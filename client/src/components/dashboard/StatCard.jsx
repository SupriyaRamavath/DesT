function StatCard({
  title,
  value,
  subtitle,
  icon = "▦",
  trend,
  trendType = "neutral",
}) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div className="stat-card-icon">
          {icon}
        </div>

        {trend && (
          <span
            className={`stat-card-trend ${trendType}`}
          >
            {trend}
          </span>
        )}
      </div>

      <div className="stat-card-content">
        <p>{title}</p>

        <h2>{value ?? "—"}</h2>

        {subtitle && (
          <small>{subtitle}</small>
        )}
      </div>
    </div>
  );
}

export default StatCard;