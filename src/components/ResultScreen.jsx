/**
 * ResultScreen component is displayed after the user finishes
 * or submits the exam.
 */
export default function ResultScreen({ onRestart }) {
  return (
    <div className="page-container">
      <div className="header-section">
        <h1>Assessment Completed</h1>
        <p>Your responses and proctoring session have been recorded successfully.</p>
      </div>

      <div className="card-container" style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ fontSize: "54px", marginBottom: "16px" }}>🎉</div>
        <h2 style={{ fontSize: "22px", marginBottom: "12px", color: "#242424" }}>
          Test Submitted
        </h2>
        <p style={{ color: "#666", fontSize: "15px", maxWidth: "480px", margin: "0 auto 28px" }}>
          Thank you for taking the assessment. Your webcam proctoring snapshots have been saved
          locally to the application archive.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
          <button onClick={onRestart} className="btn btn-dark">
            Take Another Test
          </button>
        </div>
      </div>
    </div>
  );
}
