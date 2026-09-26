import { Link } from "react-router";
import BrandLogo from "../components/common/BrandLogo";

function Home() {
  return (
    <main className="simple-page">
      <section className="simple-card hero-card">
        <BrandLogo className="hero-logo" />
        <p className="eyebrow">AI DECISION OBSERVABILITY</p>
        <p className="hero-copy">
          Capture, inspect, and review the events behind AI decisions.
        </p>
        <div className="hero-actions">
          <Link className="primary-button" to="/login">Sign in</Link>
          <Link className="secondary-button" to="/register">Create account</Link>
        </div>
      </section>
    </main>
  );
}

export default Home;
