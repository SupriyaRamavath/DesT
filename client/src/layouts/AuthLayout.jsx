import { Outlet, Link } from "react-router";

function AuthLayout() {
  return (
    <div className="auth-layout">

      <div className="auth-brand">
        <Link to="/login">
          <div className="brand-logo">D</div>
          <div>
            <h2>DecisionTrace</h2>
            <p>AI Decision Observability</p>
          </div>
        </Link>
      </div>

      <Outlet />

    </div>
  );
}

export default AuthLayout;