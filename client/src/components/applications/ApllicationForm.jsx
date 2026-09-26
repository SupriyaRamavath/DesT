import { useState } from "react";

function ApplicationForm({
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
}) {
  const [formData, setFormData] =
    useState({
      name: initialData.name || "",
      description:
        initialData.description || "",
      environment:
        initialData.environment ||
        "Development",
      apiUrl:
        initialData.apiUrl || "",
    });

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      alert(
        "Application name is required."
      );
      return;
    }

    onSubmit?.(formData);
  };

  return (
    <form
      className="application-form"
      onSubmit={handleSubmit}
    >
      <div className="form-group">
        <label>
          Application Name
        </label>

        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="e.g. Resume Screening AI"
          required
        />
      </div>

      <div className="form-group">
        <label>
          Description
        </label>

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe what this AI application does."
          rows="4"
        />
      </div>

      <div className="form-group">
        <label>
          Environment
        </label>

        <select
          name="environment"
          value={formData.environment}
          onChange={handleChange}
        >
          <option value="Development">
            Development
          </option>

          <option value="Testing">
            Testing
          </option>

          <option value="Staging">
            Staging
          </option>

          <option value="Production">
            Production
          </option>
        </select>
      </div>

      <div className="form-group">
        <label>
          API URL
        </label>

        <input
          type="url"
          name="apiUrl"
          value={formData.apiUrl}
          onChange={handleChange}
          placeholder="https://example.com/api"
        />
      </div>

      <div className="form-actions application-form-actions">
        <button
          type="button"
          className="secondary-button"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="primary-button action-accent"
          disabled={loading}
        >
          {loading
            ? "Saving..."
            : "Save Application"}
        </button>
      </div>
    </form>
  );
}

export default ApplicationForm;