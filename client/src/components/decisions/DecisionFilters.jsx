function DecisionFilters({
  filters,
  onChange,
  onReset,
}) {
  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    onChange({
      ...filters,
      [name]: value,
    });
  };

  return (
    <div className="decision-filters">
      <div className="filter-group">
        <label>Search</label>

        <input
          type="text"
          name="search"
          value={filters.search || ""}
          onChange={handleChange}
          placeholder="Search decisions..."
        />
      </div>

      <div className="filter-group">
        <label>Status</label>

        <select
          name="status"
          value={filters.status || ""}
          onChange={handleChange}
        >
          <option value="">
            All Statuses
          </option>

          <option value="Pending">
            Pending
          </option>

          <option value="Processing">
            Processing
          </option>

          <option value="Completed">
            Completed
          </option>

          <option value="Failed">
            Failed
          </option>

          <option value="Review Required">
            Review Required
          </option>
        </select>
      </div>

      <div className="filter-group">
        <label>Risk</label>

        <select
          name="riskLevel"
          value={filters.riskLevel || ""}
          onChange={handleChange}
        >
          <option value="">
            All Risk Levels
          </option>

          <option value="Low">
            Low
          </option>

          <option value="Medium">
            Medium
          </option>

          <option value="High">
            High
          </option>

          <option value="Critical">
            Critical
          </option>
        </select>
      </div>

      <button
        type="button"
        className="secondary-button"
        onClick={onReset}
      >
        Reset
      </button>
    </div>
  );
}

export default DecisionFilters;