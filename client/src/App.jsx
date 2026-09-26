import { Route, Routes } from "react-router";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AuthLayout from "./layouts/AuthLayout";
import Home from "./pages/Home";
import LocalDashboard from "./pages/LocalDashboard";
import Decisions from "./pages/Decisions";
import DecisionDetails from "./pages/DecisionDetails";
import DecisionReplay from "./pages/DecisionReplay";
import DecisionIngest from "./pages/DecisionIngest";
import Applications from "./pages/Applications";
import ApplicationsDetails from "./pages/ApplicationsDetails";
import Reviews from "./pages/Reviews";
import ReviewDetails from "./pages/ReviewDetails";
import Analytics from "./pages/Analytics";
import AuditLogs from "./pages/AuditLogs";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
      <Route path="/dashboard" element={<ProtectedRoute><LocalDashboard /></ProtectedRoute>} />
      <Route path="/decisions" element={<ProtectedRoute><Decisions /></ProtectedRoute>} />
      <Route path="/decisions/ingest" element={<ProtectedRoute><DecisionIngest /></ProtectedRoute>} />
      <Route path="/decisions/:id" element={<ProtectedRoute><DecisionDetails /></ProtectedRoute>} />
      <Route path="/decisions/:id/replay" element={<ProtectedRoute><DecisionReplay /></ProtectedRoute>} />
      <Route path="/applications" element={<ProtectedRoute><Applications /></ProtectedRoute>} />
      <Route path="/applications/:id" element={<ProtectedRoute><ApplicationsDetails /></ProtectedRoute>} />
      <Route path="/reviews" element={<ProtectedRoute><Reviews /></ProtectedRoute>} />
      <Route path="/reviews/:id" element={<ProtectedRoute><ReviewDetails /></ProtectedRoute>} />
      <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
      <Route path="/audit-logs" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;