import { Link } from "react-router";

function Reviews() {

  const reviews = [
    {
      id: "REV-001",
      decision: "DEC-1002",
      application: "Loan Assessment AI",
      reviewer: "Supriya Bai",
      status: "Pending",
      date: "Sep 24, 2026",
    },
    {
      id: "REV-002",
      decision: "DEC-0981",
      application: "Fraud Detection",
      reviewer: "Arjun",
      status: "Approved",
      date: "Sep 23, 2026",
    },
    {
      id: "REV-003",
      decision: "DEC-0972",
      application: "Resume Screening AI",
      reviewer: "Priya",
      status: "Rejected",
      date: "Sep 22, 2026",
    },
  ];

  return (
    <div>

      <div className="page-header">
        <div>
          <h1>Human Reviews</h1>
          <p>
            Review flagged AI decisions and provide human oversight.
          </p>
        </div>
      </div>

      <div className="panel">

        <div className="table-container">

          <table>

            <thead>
              <tr>
                <th>Review</th>
                <th>Decision</th>
                <th>Application</th>
                <th>Reviewer</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>

            <tbody>

              {reviews.map((review) => (

                <tr key={review.id}>

                  <td>
                    <strong>{review.id}</strong>
                  </td>

                  <td>{review.decision}</td>

                  <td>{review.application}</td>

                  <td>{review.reviewer}</td>

                  <td>
                    <span
                      className={`badge ${
                        review.status === "Pending"
                          ? "medium"
                          : review.status === "Approved"
                          ? "low"
                          : "high"
                      }`}
                    >
                      {review.status}
                    </span>
                  </td>

                  <td>{review.date}</td>

                  <td>
                    <Link
                      to={`/reviews/${review.id}`}
                      className="table-link"
                    >
                      Review
                    </Link>
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}

export default Reviews;