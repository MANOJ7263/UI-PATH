import React from "react";

export default function History({ onBack }) {
  const history = JSON.parse(localStorage.getItem("quizHistory") || "[]");

  return (
    <div className="history">
      <h2>Attempt History</h2>
      {history.length === 0 ? (
        <p>No history found.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Date</th>
              <th>Score</th>
              <th>Percentage</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h, i) => (
              <tr key={i}>
                <td>{h.name}</td>
                <td>{h.date}</td>
                <td>{h.score}/{h.total}</td>
                <td>{h.percentage}%</td>
                <td style={{ color: h.passed ? "green" : "red" }}>
                  {h.passed ? "Pass" : "Fail"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button onClick={onBack}>Back to Home</button>
    </div>
  );
}
