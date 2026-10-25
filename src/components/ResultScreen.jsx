import { useState } from "react";
import { MOCK_QUESTIONS } from "../data/mockQuestions";

/**
 * ResultScreen component evaluates student performance with:
 * - Grade badges and time-taken analytics
 * - Category-by-category proficiency progress bars
 * - Proctoring session audit logs
 * - Export Report (JSON & Printable PDF)
 * - Detailed question-by-question answer review
 */
export default function ResultScreen({
  questions = MOCK_QUESTIONS,
  answers = {},
  violations = [],
  terminationReason = null,
  timeSpentMs = 0,
  onRestart,
  onQuitApp,
}) {
  const [showReview, setShowReview] = useState(false);
  const [showIntegrityLog, setShowIntegrityLog] = useState(false);

  const totalQuestions = questions.length;
  let correctCount = 0;
  let incorrectCount = 0;

  // Category performance mapping
  const categoryStats = {};

  questions.forEach((q, idx) => {
    const cat = q.category || "General";
    if (!categoryStats[cat]) {
      categoryStats[cat] = { total: 0, correct: 0 };
    }
    categoryStats[cat].total += 1;

    const userChoice = answers[idx];
    if (userChoice !== undefined) {
      if (userChoice === q.correctAnswer) {
        correctCount += 1;
        categoryStats[cat].correct += 1;
      } else {
        incorrectCount += 1;
      }
    }
  });

  const unattemptedCount = totalQuestions - (correctCount + incorrectCount);
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const violationCount = violations.length;

  // Calculate grade
  let grade = "F";
  let gradeLabel = "Needs Improvement";
  let gradeColor = "#ef4444";

  if (percentage >= 90) {
    grade = "A+";
    gradeLabel = "Outstanding (Distinction)";
    gradeColor = "#059669";
  } else if (percentage >= 75) {
    grade = "A";
    gradeLabel = "Excellent";
    gradeColor = "#10b981";
  } else if (percentage >= 60) {
    grade = "B";
    gradeLabel = "Qualified (Pass)";
    gradeColor = "#2563eb";
  } else if (percentage >= 45) {
    grade = "C";
    gradeLabel = "Satisfactory";
    gradeColor = "#f59e0b";
  }

  // Format time taken
  function formatDuration(ms) {
    if (!ms || ms <= 0) return "0m 00s";
    const totalSec = Math.floor(ms / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}m ${secs.toString().padStart(2, "0")}s`;
  }

  // Export report as JSON file
  function handleExportJSON() {
    const reportData = {
      assessment: "Athena Desktop Examination",
      generatedAt: new Date().toISOString(),
      studentScore: `${correctCount}/${totalQuestions}`,
      percentage: `${percentage}%`,
      grade,
      timeTaken: formatDuration(timeSpentMs),
      proctoringIncidents: violationCount,
      violationsList: violations,
      answersSummary: questions.map((q, idx) => ({
        questionId: q.id,
        category: q.category,
        question: q.question,
        selectedOption: answers[idx] !== undefined ? q.options[answers[idx]] : "Skipped",
        correctOption: q.options[q.correctAnswer],
        isCorrect: answers[idx] === q.correctAnswer,
      })),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Athena-Assessment-Report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Print report
  function handlePrint() {
    window.print();
  }

  return (
    <div className="page-container result-page">
      <div className="header-section">
        <h1>Assessment Report & Performance Analytics</h1>
        <p>Verified summary of test responses, time management, and proctoring audit.</p>
      </div>

      <div className="card-container result-card-main">
        {/* Termination Alert */}
        {terminationReason && (
          <div className="termination-banner">
            <span className="termination-icon">⛔</span>
            <div>
              <h4>Assessment Terminated</h4>
              <p>{terminationReason}</p>
            </div>
          </div>
        )}

        {/* Score & Grade Hero Banner */}
        <div className="result-score-banner">
          <div className="grade-badge-circle" style={{ borderColor: gradeColor, color: gradeColor }}>
            {grade}
          </div>
          <h2 className="result-score-title">
            Score: {correctCount} / {totalQuestions} ({percentage}%)
          </h2>
          <p className="result-score-subtitle">
            Performance Rating: <strong>{gradeLabel}</strong>
          </p>
        </div>

        {/* 4 Key Metrics Cards */}
        <div className="result-metrics-grid">
          <div className="metric-box metric-correct">
            <span className="metric-number">{correctCount}</span>
            <span className="metric-label">Correct</span>
          </div>
          <div className="metric-box metric-incorrect">
            <span className="metric-number">{incorrectCount}</span>
            <span className="metric-label">Incorrect</span>
          </div>
          <div className="metric-box metric-unattempted">
            <span className="metric-number">{unattemptedCount}</span>
            <span className="metric-label">Skipped</span>
          </div>
          <div className="metric-box metric-time">
            <span className="metric-number" style={{ fontSize: "20px" }}>{formatDuration(timeSpentMs)}</span>
            <span className="metric-label">Time Taken</span>
          </div>
        </div>

        {/* Category Performance Breakdown */}
        <div className="category-performance-section">
          <h4 className="section-subheading">Subject Proficiency Breakdown</h4>
          <div className="category-bars-list">
            {Object.entries(categoryStats).map(([catName, stats]) => {
              const catPercent = Math.round((stats.correct / stats.total) * 100);
              return (
                <div key={catName} className="category-progress-item">
                  <div className="category-label-row">
                    <span className="category-name">{catName}</span>
                    <span className="category-score">
                      {stats.correct}/{stats.total} ({catPercent}%)
                    </span>
                  </div>
                  <div className="category-progress-track">
                    <div
                      className="category-progress-fill"
                      style={{
                        width: `${catPercent}%`,
                        backgroundColor:
                          catPercent >= 70
                            ? "#10b981"
                            : catPercent >= 40
                            ? "#f59e0b"
                            : "#ef4444",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Proctoring Integrity Summary Box */}
        <div className={`integrity-summary-card ${violationCount > 0 ? "integrity-flagged" : "integrity-clean"}`}>
          <div className="integrity-card-header">
            <div className="integrity-status-info">
              <span className="integrity-icon">
                {violationCount === 0 ? "🛡️" : "⚠️"}
              </span>
              <div>
                <h4>
                  Proctoring Audit:{" "}
                  {violationCount === 0 ? "Clean Session (Verified)" : `Flagged (${violationCount} Incident${violationCount > 1 ? "s" : ""})`}
                </h4>
                <p>
                  {violationCount === 0
                    ? "Full integrity maintained: No window switching or prohibited shortcuts detected."
                    : `${violationCount} window focus loss event(s) logged during testing.`}
                </p>
              </div>
            </div>

            {violationCount > 0 && (
              <button
                type="button"
                onClick={() => setShowIntegrityLog((prev) => !prev)}
                className="btn-integrity-toggle"
              >
                {showIntegrityLog ? "Hide Log" : "View Incident Log"}
              </button>
            )}
          </div>

          {/* Incident Log Table */}
          {showIntegrityLog && violationCount > 0 && (
            <div className="incident-log-table">
              <div className="incident-row incident-header-row">
                <span>Time</span>
                <span>Incident Type</span>
                <span>Description</span>
              </div>
              {violations.map((v, i) => (
                <div key={v.id || i} className="incident-row">
                  <span className="incident-time">{v.timestamp}</span>
                  <span className="incident-type">{v.type}</span>
                  <span className="incident-reason">{v.reason}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Report Action Buttons */}
        <div className="result-actions no-print">
          <button
            onClick={() => setShowReview((prev) => !prev)}
            className="btn btn-outline"
          >
            {showReview ? "Hide Question Review" : "Review All Questions & Answers"}
          </button>

          <button onClick={handleExportJSON} className="btn btn-outline">
            💾 Export JSON
          </button>

          <button onClick={handlePrint} className="btn btn-outline">
            🖨️ Print Report
          </button>

          <button onClick={onRestart} className="btn btn-dark">
            Take Another Test
          </button>

          {onQuitApp && (
            <button onClick={onQuitApp} className="btn btn-outline btn-quit">
              Exit App
            </button>
          )}
        </div>

        {/* Detailed Question Review List */}
        {showReview && (
          <div className="review-section">
            <h3 className="review-section-heading">Detailed Question Review</h3>

            {questions.map((q, idx) => {
              const userChoice = answers[idx];
              const isAnswered = userChoice !== undefined;
              const isCorrect = userChoice === q.correctAnswer;

              let statusLabel = "Skipped";
              let statusClass = "review-status-skipped";

              if (isAnswered) {
                if (isCorrect) {
                  statusLabel = "Correct";
                  statusClass = "review-status-correct";
                } else {
                  statusLabel = "Incorrect";
                  statusClass = "review-status-incorrect";
                }
              }

              return (
                <div key={q.id} className="review-question-card">
                  <div className="review-question-header">
                    <span className="review-question-number">
                      Question {idx + 1} • <span style={{ fontWeight: 400 }}>{q.category}</span>
                    </span>
                    <span className={`review-status-pill ${statusClass}`}>
                      {statusLabel}
                    </span>
                  </div>

                  <p className="review-question-text">{q.question}</p>

                  <div className="review-options-list">
                    {q.options.map((option, optIdx) => {
                      const isSelected = userChoice === optIdx;
                      const isTheRightAnswer = optIdx === q.correctAnswer;

                      let optionClass = "review-option-default";
                      if (isTheRightAnswer) {
                        optionClass = "review-option-correct";
                      } else if (isSelected && !isTheRightAnswer) {
                        optionClass = "review-option-wrong";
                      }

                      return (
                        <div key={optIdx} className={`review-option-item ${optionClass}`}>
                          <span className="review-option-bullet">
                            {isTheRightAnswer ? "✓" : isSelected ? "✗" : "•"}
                          </span>
                          <span>{option}</span>
                          {isSelected && (
                            <span className="user-choice-badge">(Your Answer)</span>
                          )}
                          {isTheRightAnswer && (
                            <span className="correct-answer-badge">(Correct)</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="review-explanation">
                      <strong>Explanation: </strong>
                      <span>{q.explanation}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
