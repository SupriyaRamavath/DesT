import { useState } from "react";
import { Link, useNavigate } from "react-router";

import useAuth from "../../hooks/useAuth";

function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    login(formData)
      .then(() => navigate("/dashboard"))
      .catch((requestError) => setError(requestError.response?.data?.message || "Unable to sign in."))
      .finally(() => setLoading(false));
  };

  return (
    <div className="auth-card">

      <div className="auth-header">
        <h1>Welcome back</h1>
        <p>
          Sign in to your DecisionTrace account.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <p className="error-message">{error}</p>}

        <div className="form-group">
          <label>Email</label>

          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Password</label>

          <input
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <div className="form-options">

          <label>
            <input type="checkbox" />
            Remember me
          </label>

          <button
            type="button"
            className="link-button"
          >
            Forgot password?
          </button>

        </div>

        <button
          type="submit"
          className="primary-button full-width"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

      </form>

      <div className="auth-footer">
        Don't have an account?

        <Link to="/register">
          {" "}Create account
        </Link>
      </div>

    </div>
  );
}

export default Login;