import { useState } from "react";
import { Link, useNavigate } from "react-router";
import useAuth from "../../hooks/useAuth";

function Register() {

  const navigate = useNavigate();
  const { register } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

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
    register(formData)
      .then(() => navigate("/dashboard"))
      .catch((requestError) => setError(requestError.response?.data?.message || "Unable to create account."))
      .finally(() => setLoading(false));
  };

  return (
    <div className="auth-card">

      <div className="auth-header">
        <h1>Create account</h1>
        <p>Start monitoring and auditing AI decisions.</p>
      </div>

      <form onSubmit={handleSubmit}>
        {error && <p className="error-message">{error}</p>}

        <div className="form-group">
          <label>Full Name</label>

          <input
            type="text"
            name="name"
            placeholder="Your full name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>

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
            placeholder="Create a password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <button className="primary-button full-width">
          {loading ? "Creating account..." : "Create Account"}
        </button>

      </form>

      <div className="auth-footer">
        Already have an account?
        <Link to="/login"> Sign in</Link>
      </div>

    </div>
  );
}

export default Register;