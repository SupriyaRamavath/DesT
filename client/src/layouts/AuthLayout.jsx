import { Outlet, Link } from "react-router";
import BrandLogo from "../components/common/BrandLogo";

function AuthLayout() {
  return (
    <main className="simple-page">
      <Link className="simple-brand" to="/" aria-label="DesT home">
        <BrandLogo />
      </Link>
      <Outlet />
    </main>
  );
}

export default AuthLayout;