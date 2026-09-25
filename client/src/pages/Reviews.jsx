import { Link, useParams } from "react-router";

function DecisionDetails() {

  const { id } = useParams();

  const events = [
    {
      step: 1,
      title: "Input Received",
      description: "Candidate resume was received.",
      time: "10:32:01",
    },
    {
      step: 2,
      title: "Information Extraction",
      description: "Resume information was extracted.",
      time: "10:32:03",
    },
    {
      step: 3,
      title: "Skills Identified",
      description: "Python, JavaScript, React and SQL detected.",
      time: "10:32:04",
    },
    {
      step: 4,
      title: "Requirement Matching",
      description: "Candidate skills matched against job requirements.",
      time: "10:32:05",
    },
    {
      step: 5,
      title: "Final Decision",
      description: "Candidate marked as qualified.",
      time: "10:32:06",
    },
  ];

  return (
    <div>

      <div className="breadcrumb">
        <Link to="/decisions">Decisions</Link>
        <span>/</span>
        <span>{id}</span>
      </div>

      <div className="page-header">

        <div>
          <h1>{id}</h1>
          <p>Decision inspection and audit information.</p>
        </div>

        <Link
          to={`/decisions/${id}/replay`}
          className="primary-button"
        >
          ▶ Replay Decision
        </Link>

      </div>

      <div className="detail-grid">

        <div className="panel">

          <h2>Decision Summary</h2>

          <div className="detail-list">

            <div>
              <span>Application</span>
              <strong>Resume Screening AI</strong>
            </div>

            <div>
              <span>Result</span>
              <strong>Qualified</strong>
            </div>

            <div>
              <span>Confidence</span>
              <strong>94%</strong>
            </div>

            <div>
              <span>Risk Level</span>
              <span className="badge low">Low</span>
            </div>

            <div>
              <span>Created</span>
              <strong>September 24, 2026</strong>
            </div>

          </div>

        </div>

        <div className="panel">

          <h2>Decision Metrics</h2>

          <div className="metric-big">
            <span>94%</span>
            <small>Confidence</small>
          </div>

          <div className="metric-row">
            <span>Evidence Used</span>
            <strong>8</strong>
          </div>

          <div className="metric-row">
            <span>Processing Time</span>
            <strong>5.2 sec</strong>
          </div>

          <div className="metric-row">
            <span>Review Status</span>
            <strong>Not Required</strong>
          </div>

        </div>

      </div>

      <div className="panel">

        <div className="panel-header">
          <div>
            <h2>Decision Journey</h2>
            <p>Events recorded during decision processing.</p>
          </div>

          <Link to={`/decisions/${id}/replay`}>
            Open Replay →
          </Link>
        </div>

        <div className="timeline">

          {events.map((event) => (

            <div className="timeline-item" key={event.step}>

              <div className="timeline-number">
                {event.step}
              </div>

              <div className="timeline-content">
                <h3>{event.title}</h3>
                <p>{event.description}</p>
                <small>{event.time}</small>
              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}

export default DecisionDetails;