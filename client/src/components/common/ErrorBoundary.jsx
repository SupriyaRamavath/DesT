import { Component } from "react";

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Unhandled frontend error:", error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="empty-page" role="alert">
        <div className="error-code">500</div>
        <h1>Something went wrong</h1>
        <p>DecisionTrace could not render this page. Try again or return to the dashboard.</p>
        <div className="form-actions">
          <button type="button" className="primary-button" onClick={this.handleReload}>
            Try again
          </button>
          <a className="secondary-button" href="/dashboard">Dashboard</a>
        </div>
      </main>
    );
  }
}

export default ErrorBoundary;
