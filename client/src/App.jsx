import {
  Navigate,
  Route,
  Routes,
} from "react-router";

/* =========================
   Layouts
========================= */
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";

/* =========================
   Common Components
========================= */
import ProtectedRoute from "./components/common/ProtectedRoute";

/* =========================
   Authentication Pages
========================= */
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

/* =========================
   Main Pages
========================= */
import Dashboard from "./pages/Dashboard";
import Decisions from "./pages/Decisions";
import DecisionDetails from "./pages/DecisionDetails";
import DecisionReplay from "./pages/DecisionReplay";

import Applications from "./pages/Applications";
import ApplicationDetails from "./pages/ApplicationsDetails";

import Reviews from "./pages/Reviews";
import ReviewDetails from "./pages/ReviewDetails";

import AuditLogs from "./pages/AuditLogs";
import Analytics from "./pages/Analytics";

import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";

/* =========================
   Error Pages
========================= */
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";

function App() {
  return (
    <Routes>
      {/* ========================================
          ROOT
      ======================================== */}

      <Route
        path="/"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

      {/* ========================================
          AUTHENTICATION ROUTES
      ======================================== */}

      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />
      </Route>

      {/* ========================================
          PROTECTED APPLICATION ROUTES
      ======================================== */}

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* =========================
            Dashboard
        ========================= */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* =========================
            Decisions
        ========================= */}

        <Route
          path="/decisions"
          element={<Decisions />}
        />

        <Route
          path="/decisions/:id"
          element={<DecisionDetails />}
        />

        <Route
          path="/decisions/:id/replay"
          element={<DecisionReplay />}
        />

        {/* =========================
            Applications
        ========================= */}

        <Route
          path="/applications"
          element={<Applications />}
        />

        <Route
          path="/applications/:id"
          element={<ApplicationDetails />}
        />

        {/* =========================
            Reviews
        ========================= */}

        <Route
          path="/reviews"
          element={<Reviews />}
        />

        <Route
          path="/reviews/:id"
          element={<ReviewDetails />}
        />

        {/* =========================
            Analytics
        ========================= */}

        <Route
          path="/analytics"
          element={<Analytics />}
        />

        {/* =========================
            Audit Logs
        ========================= */}

        <Route
          path="/audit-logs"
          element={<AuditLogs />}
        />

        {/* =========================
            Notifications
        ========================= */}

        <Route
          path="/notifications"
          element={<Notifications />}
        />

        {/* =========================
            Profile
        ========================= */}

        <Route
          path="/profile"
          element={<Profile />}
        />
      </Route>

      {/* ========================================
          UNAUTHORIZED
      ======================================== */}

      <Route
        path="/unauthorized"
        element={<Unauthorized />}
      />

      {/* ========================================
          404
      ======================================== */}

      <Route
        path="*"
        element={<NotFound />}
      />
    </Routes>
  );
}

export default App;