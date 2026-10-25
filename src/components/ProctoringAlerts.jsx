/**
 * ProctoringAlerts component renders:
 * 1. An urgent modal warning when focus is lost (Alt-Tab / Window switched).
 * 2. A floating top toast notification for blocked shortcuts (Right-click, Copy, Paste).
 */
export default function ProctoringAlerts({
  activeWarning,
  toastMessage,
  onDismissWarning,
}) {
  return (
    <>
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="proctoring-toast">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Urgent Warning Modal on Focus Loss */}
      {activeWarning && (
        <div className="modal-overlay warning-overlay">
          <div className="modal-dialog warning-dialog">
            <div className="warning-icon-wrapper">
              <span className="warning-icon">⚠️</span>
            </div>

            <h3 className="warning-title">
              Proctoring Violation Detected
            </h3>

            <div className="warning-badge-pill">
              Warning {activeWarning.count} of {activeWarning.max}
            </div>

            <p className="warning-description">{activeWarning.reason}</p>

            <div className="warning-consequences-box">
              {activeWarning.remaining > 0 ? (
                <p>
                  <strong>Notice:</strong> You have{" "}
                  <span className="warning-highlight">
                    {activeWarning.remaining}{" "}
                    {activeWarning.remaining === 1 ? "strike" : "strikes"}
                  </span>{" "}
                  remaining before your exam is <strong>automatically terminated and submitted</strong>.
                </p>
              ) : (
                <p className="warning-terminated-text">
                  <strong>Threshold Exceeded:</strong> Maximum violations reached. Your assessment is being submitted.
                </p>
              )}
            </div>

            <div className="modal-actions">
              {activeWarning.remaining > 0 ? (
                <button
                  type="button"
                  onClick={onDismissWarning}
                  className="btn btn-dark btn-warning-action"
                >
                  I Understand, Return to Test
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="btn btn-dark"
                  style={{ opacity: 0.7, cursor: "wait" }}
                >
                  Submitting Assessment...
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
