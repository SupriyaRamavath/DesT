import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import Loading from "../components/common/Loading";
import ErrorMessage from "../components/common/ErrorMessage";
import { getDecisionReplay } from "../services/decisionService";

function DecisionReplay() {
  const { id } = useParams();
  const [replay, setReplay] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReplay = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getDecisionReplay(id);
      setReplay(response.data || null);
      setCurrentStep(0);
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Unable to load decision replay.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    getDecisionReplay(id)
      .then((response) => {
        if (active) {
          setReplay(response.data || null);
          setCurrentStep(0);
        }
      })
      .catch((loadError) => {
        if (active) setError(loadError.response?.data?.message || "Unable to load decision replay.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [id]);

  if (loading) return <Loading message="Loading decision replay..." />;
  if (error) return <ErrorMessage message={error} onRetry={loadReplay} />;

  const steps = replay?.events || [];
  const step = steps[currentStep];

  if (!steps.length) {
    return (
      <div>
        <div className="breadcrumb"><Link to="/decisions">Decisions</Link><span>/</span><span>{id} / Replay</span></div>
        <div className="page-header"><div><h1>Decision Replay</h1><p>No replay events have been recorded for this decision.</p></div></div>
      </div>
    );
  }

  return (
    <div>

      <div className="breadcrumb">
        <Link to="/decisions">Decisions</Link>
        <span>/</span>
        <Link to={`/decisions/${id}`}>
          {id}
        </Link>
        <span>/ Replay</span>
      </div>

      <div className="page-header">

        <div>
          <h1>Decision Replay</h1>
          <p>
            Reconstructing the decision journey for {id}.
          </p>
        </div>

        <span className="live-badge">
          ● Replay Mode
        </span>

      </div>

      <div className="replay-container">

        <div className="replay-sidebar">

          <h3>Decision Journey</h3>

          {steps.map((item, index) => (

            <button
              key={item._id || item.sequence || index}
              className={
                currentStep === index
                  ? "replay-step active"
                  : "replay-step"
              }
              onClick={() => setCurrentStep(index)}
            >

              <span className="step-number">
                {index + 1}
              </span>

              <span>
                <strong>{item.name || item.title || `Event ${index + 1}`}</strong>
                <small>{item.type}</small>
              </span>

            </button>

          ))}

        </div>

        <div className="replay-main">

          <div className="replay-counter">
            Step {currentStep + 1} of {steps.length}
          </div>

          <div className="replay-event-card">

            <div className="event-type">
              {step.type}
            </div>

            <h2>{step.name || step.title}</h2>

            <p>{step.description || "No description recorded."}</p>

            <div className="event-data">
              <span>Recorded Data</span>
              <strong>{typeof step.data === "object" ? JSON.stringify(step.data) : step.data || "No data recorded."}</strong>
            </div>

          </div>

          <div className="replay-controls">

            <button
              className="secondary-button"
              disabled={currentStep === 0}
              onClick={() =>
                setCurrentStep((prev) => prev - 1)
              }
            >
              ← Previous
            </button>

            <button
              className="primary-button"
              disabled={currentStep === steps.length - 1}
              onClick={() =>
                setCurrentStep((prev) => prev + 1)
              }
            >
              Next →
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default DecisionReplay;