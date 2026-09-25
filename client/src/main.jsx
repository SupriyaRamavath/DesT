import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";

import App from "./App";

/* =========================
   Context Providers
========================= */
import AuthProvider from "./context/AuthContext";
import NotificationProvider from "./context/NotificationContext";
import ErrorBoundary from "./components/common/ErrorBoundary";

/* =========================
   Global CSS
========================= */
import "./index.css";

ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);