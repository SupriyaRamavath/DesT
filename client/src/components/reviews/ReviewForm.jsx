import { useState } from "react";

function ReviewForm({
  initialData = {},
  onSubmit,
  loading = false,
}) {
  const [formData, setFormData] =
    useState({
      status:
        initialData.status || "Approved",
      comment:
        initialData.comment || "",
      modifiedResult:
        initialData.modifiedResult ||
        "",
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

    if (!formData.comment.trim()) {
      alert(
        "Please provide a review comment."
      );
      return;
    }

    onSubmit?.(formData);
  };

  return (
    <form
      className="review-form"
      onSubmit={handleSubmit}
    >
      <div className="form-group">
        <label>
          Review Decision
        </label>

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="Approved">
            Approve
          </option>

          <option value="Rejected">
            Reject
          </option>

          <option value="Modified">
            Modify
          </option>
        </select>
      </div>

      {formData.status ===
        "Modified" && (
        <div className="form-group">
          <label>
            Modified Result
          </label>

          <input
            type="text"
            name="modifiedResult"
            value={
              formData.modifiedResult
            }
            onChange={handleChange}
            placeholder="Enter modified decision result"
          />
        </div>
      )}

      <div className="form-group">
        <label>
          Review Comment
        </label>

        <textarea
          name="comment"
          value={formData.comment}
          onChange={handleChange}
          rows="5"
          placeholder="Explain your review decision..."
          required
        />
      </div>

      <button
        type="submit"
        className="primary-button"
        disabled={loading}
      >
        {loading
          ? "Submitting..."
          : "Submit Review"}
      </button>
    </form>
  );
}

export default ReviewForm;