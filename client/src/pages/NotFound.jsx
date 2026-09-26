import { Link, useNavigate } from "react-router";
import BrandLogo from "../components/common/BrandLogo";

function NotFound() {
  const navigate = useNavigate();

  return (
    <main className="not-found-page">
      <section className="not-found-card" aria-labelledby="not-found-title">
        <BrandLogo className="not-found-logo" />
        <div className="trace-illustration" aria-hidden="true">
          <span />
          <i />
          <span />
          <i />
          <b>?</b>
        </div>
        <p className="not-found-code">404</p>
        <h1 id="not-found-title">Page Not Found</h1>
        <p className="not-found-message">The page you&apos;re looking for doesn&apos;t exist or may have been moved.</p>
        <div className="not-found-actions">
          <Link className="primary-button" to="/dashboard">Go to Dashboard</Link>
          <button className="secondary-button" type="button" onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </section>
    </main>
  );
}

export default NotFound;
