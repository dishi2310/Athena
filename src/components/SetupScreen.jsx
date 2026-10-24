
/**
 * SetupScreen component guides the user through camera access
 * and fullscreen mode prerequisites before taking the test.
 */
export default function SetupScreen({
  cameraReady,
  onRequestCamera,
  fullscreenReady,
  onRequestFullscreen,
  onStartExam,
}) {
  function handleHelpClick() {
    alert(
      "Exam Guidelines:\n\n" +
        "1. Camera permission is required for identity verification.\n" +
        "2. Fullscreen mode ensures an uninterrupted testing environment.\n" +
        "3. Once the exam starts, do not switch tabs or minimize the window.\n" +
        "4. Periodic snapshots are taken for automated proctoring."
    );
  }

  return (
    <div className="page-container">
      <div className="header-section">
        <h1>Hi User!</h1>
        <p>Kindly Allow the following Permissions to Start the test:</p>
      </div>

      <div className="card-container">
        {/* Permission 1: Camera */}
        <div className="permission-item">
          <div className="permission-icon">↗</div>
          <div className="permission-content">
            <h3>Configure Camera</h3>
            <p>Kindly configure Camera to attempt quiz/contests.</p>
            <div className="action-row">
              {cameraReady ? (
                <button className="btn btn-dark" disabled style={{ opacity: 0.85, cursor: "default" }}>
                  Camera Configured ✓
                </button>
              ) : (
                <button onClick={onRequestCamera} className="btn btn-dark">
                  Get Camera Access
                </button>
              )}
            </div>
            {cameraReady && <div className="camera-space" />}
          </div>
        </div>

        <div className="divider" />

        {/* Permission 2: Fullscreen */}
        <div className="permission-item">
          <div className="permission-icon">⛶</div>
          <div className="permission-content">
            <h3>Switch to full screen</h3>
            <p>Kindly close all tabs and switch to full screen.</p>
            <div className="action-row">
              {fullscreenReady ? (
                <button
                  className="btn btn-light-blue"
                  disabled
                  style={{ opacity: 0.85, cursor: "default" }}
                >
                  Fullscreen Enabled ✓
                </button>
              ) : (
                <button onClick={onRequestFullscreen} className="btn btn-light-blue">
                  Give Full Screen Permissions
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bottom-actions">
        <button
          onClick={onStartExam}
          className="btn btn-light-blue"
          style={{
            cursor: cameraReady ? "pointer" : "not-allowed",
            opacity: cameraReady ? 1 : 0.65,
          }}
        >
          Go To Test
        </button>
        <button onClick={handleHelpClick} className="btn btn-outline">
          Need Help?
        </button>
      </div>
    </div>
  );
}


