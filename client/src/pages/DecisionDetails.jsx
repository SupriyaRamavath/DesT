import { useState } from "react";
import { Link, useParams } from "react-router";

function DecisionReplay() {

  const { id } = useParams();

  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Input Received",
      type: "INPUT",
      description:
        "Candidate resume was submitted to the Resume Screening AI.",
      data: "resume_874.pdf",
    },
    {
      title: "Information Extraction",
      type: "PROCESSING",
      description:
        "The AI extracted education, experience and technical skills.",
      data: "Education, Experience, Skills",
    },
    {
      title: "Skills Identified",
      type: "EVIDENCE",
      description:
        "The following technical skills were detected.",
      data: "Python • JavaScript • React • SQL",
    },
    {
      title: "Requirement Matching",
      type: "ANALYSIS",
      description:
        "Candidate skills were compared with job requirements.",
      data: "Match Score: 91%",
    },
    {
      title: "Confidence Analysis",
      type: "ANALYSIS",
      description:
        "The system calculated confidence based on available evidence.",
      data: "Confidence: 94%",
    },
    {
      title: "Final Decision",
      type: "DECISION",
      description:
        "The AI produced the final decision.",
      data: "Qualified",
    },
  ];

  const step = steps[currentStep];

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
              key={index}
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
                <strong>{item.title}</strong>
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

            <h2>{step.title}</h2>

            <p>{step.description}</p>

            <div className="event-data">
              <span>Recorded Data</span>
              <strong>{step.data}</strong>
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