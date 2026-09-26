import { Link, useNavigate } from "react-router";
import BrandLogo from "../components/common/BrandLogo";

function Unauthorized() {
  const navigate = useNavigate();

  return (
    <main className="unauthorized-page">
      <section className="unauthorized-card" aria-labelledby="unauthorized-title">
        <BrandLogo className="unauthorized-logo" />
        <div className="unauthorized-shield" aria-hidden="true">✓</div>
        <p className="unauthorized-code">403</p>
        <h1 id="unauthorized-title">Access Restricted</h1>
        <p className="unauthorized-message">You don&apos;t have permission to access this page.</p>
        <div className="unauthorized-actions">
          <Link className="primary-button" to="/dashboard">Go to Dashboard</Link>
          <button className="secondary-button" type="button" onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </section>
    </main>
  );
}

export default Unauthorized;
