import { useState } from "react";
import QuestionPalette from "./QuestionPalette";
import ProctoringAlerts from "./ProctoringAlerts";
import useProctoring from "../hooks/useProctoring";
import { MOCK_QUESTIONS } from "../data/mockQuestions";

/**
 * ExamScreen component manages question display, option selections,
 * review flags, navigation, visual palette, and proctoring safeguards.
 */
export default function ExamScreen({
  questions = MOCK_QUESTIONS,
  answers = {},
  onSelectAnswer,
  onClearAnswer,
  remainingTime,
  formatTimeLeft,
  onEndExam,
  onRecordViolations,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewSet, setReviewSet] = useState(new Set());
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Initialize anti-cheating and window blur detection
  const {
    violations,
    violationCount,
    activeWarning,
    toastMessage,
    dismissWarning,
    maxWarnings,
  } = useProctoring({
    isActive: true,
    onMaxViolationsExceeded: (allViolations) => {
      if (onRecordViolations) {
        onRecordViolations(allViolations);
      }
      // Give student 1.8s to see the final termination warning before submitting
      setTimeout(() => {
        onEndExam("Exceeded maximum allowed window focus violations (3 strikes).");
      }, 1800);
    },
  });

  const currentQuestion = questions[currentIndex] || questions[0];
  const totalQuestions = questions.length;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalQuestions - 1;
  const isMarkedForReview = reviewSet.has(currentIndex);
  const hasAnsweredCurrent = answers[currentIndex] !== undefined;

  // Option selection
  function handleOptionSelect(optionIndex) {
    if (onSelectAnswer) {
      onSelectAnswer(currentIndex, optionIndex);
    }
  }

  // Clear current question's answer
  function handleClearCurrent() {
    if (onClearAnswer) {
      onClearAnswer(currentIndex);
    }
  }

  // Toggle mark for review
  function handleToggleReview() {
    setReviewSet((prev) => {
      const next = new Set(prev);
      if (next.has(currentIndex)) {
        next.delete(currentIndex);
      } else {
        next.add(currentIndex);
      }
      return next;
    });
  }

  // Navigation handlers
  function handleNext() {
    if (isLast) {
      setShowSubmitModal(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }

  function handlePrev() {
    if (!isFirst) {
      setCurrentIndex((prev) => prev - 1);
    }
  }

  function handleDirectJump(index) {
    if (index >= 0 && index < totalQuestions) {
      setCurrentIndex(index);
    }
  }

  function handleConfirmSubmit() {
    if (onRecordViolations) {
      onRecordViolations(violations);
    }
    setShowSubmitModal(false);
    onEndExam();
  }

  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;

  const isTimeCritical = remainingTime <= 60 * 1000;
  const isTimeWarning = remainingTime <= 5 * 60 * 1000;
  const timerClass = isTimeCritical ? "timer-critical" : isTimeWarning ? "timer-warning" : "timer-normal";

  return (
    <div className="exam-page unselectable-exam">
      {/* Active Anti-Cheating Alerts & Notifications */}
      <ProctoringAlerts
        activeWarning={activeWarning}
        toastMessage={toastMessage}
        onDismissWarning={dismissWarning}
      />

      <div className="exam-container">
        {/* Top Header */}
        <div className="exam-header">
          <div className="exam-title-meta">
            <div className="exam-meta-row">
              <h3>Athena Assessment</h3>
              <span className={`proctor-status-pill ${violationCount > 0 ? "proctor-pill-warning" : "proctor-pill-active"}`}>
                <span className="live-dot" />
                Proctoring Active • Warnings: {violationCount}/{maxWarnings}
              </span>
            </div>
            <span className={`exam-timer ${timerClass}`}>
              ⏱ Time Left: <strong>{formatTimeLeft(remainingTime)}</strong>
              {isTimeCritical && <span className="timer-badge-urgent">Final Minute!</span>}
              {!isTimeCritical && isTimeWarning && <span className="timer-badge-warning">&lt; 5m left</span>}
            </span>
          </div>

          <button onClick={() => setShowSubmitModal(true)} className="end-test-btn">
            End Test
          </button>
        </div>

        {/* Exam Body: Question Card (Left) + Question Palette (Right) */}
        <div className="exam-layout">
          {/* Main Question Card */}
          <div className="question-card">
            <div className="question-card-header">
              <span className="question-index-badge">
                Question {currentIndex + 1} of {totalQuestions}
              </span>
              {currentQuestion.category && (
                <span className="category-pill">{currentQuestion.category}</span>
              )}
            </div>

            <p className="question-text">{currentQuestion.question}</p>

            {/* Options list */}
            <div className="options-container">
              {currentQuestion.options.map((option, idx) => {
                const isChecked = answers[currentIndex] === idx;
                return (
                  <label
                    key={idx}
                    className={`option-row ${isChecked ? "option-selected" : ""}`}
                    onClick={() => handleOptionSelect(idx)}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={idx}
                      checked={isChecked}
                      onChange={() => handleOptionSelect(idx)}
                    />
                    <span className="option-label">{option}</span>
                  </label>
                );
              })}
            </div>

            {/* In-Card Secondary Actions (Clear & Mark for Review) */}
            <div className="question-secondary-actions">
              <button
                type="button"
                onClick={handleToggleReview}
                className={`btn-secondary-action ${
                  isMarkedForReview ? "btn-review-active" : ""
                }`}
              >
                {isMarkedForReview ? "★ Marked for Review" : "☆ Mark for Review"}
              </button>

              {hasAnsweredCurrent && (
                <button
                  type="button"
                  onClick={handleClearCurrent}
                  className="btn-secondary-action btn-clear"
                >
                  Clear Selection
                </button>
              )}
            </div>

            {/* Primary Navigation Buttons */}
            <div className="navigation-buttons">
              <button onClick={handlePrev} disabled={isFirst}>
                ← Previous
              </button>

              <button
                onClick={handleNext}
                className={isLast ? "btn-submit-action" : ""}
              >
                {isLast ? "Submit Exam →" : "Next →"}
              </button>
            </div>
          </div>

          {/* Sidebar: Question Palette */}
          <div className="exam-sidebar">
            <QuestionPalette
              totalQuestions={totalQuestions}
              currentIndex={currentIndex}
              answers={answers}
              reviewSet={reviewSet}
              onSelectQuestion={handleDirectJump}
            />
          </div>
        </div>
      </div>

      {/* Confirmation Modal before Final Submit */}
      {showSubmitModal && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <h3>Ready to Submit?</h3>
            <p className="modal-description">
              Please review your test progress before submitting:
            </p>

            <div className="modal-stats-grid">
              <div className="modal-stat-box">
                <span className="stat-number stat-answered">{answeredCount}</span>
                <span className="stat-label">Answered</span>
              </div>
              <div className="modal-stat-box">
                <span className="stat-number stat-unanswered">{unansweredCount}</span>
                <span className="stat-label">Unanswered</span>
              </div>
              <div className="modal-stat-box">
                <span className="stat-number stat-review">{reviewSet.size}</span>
                <span className="stat-label">Marked for Review</span>
              </div>
            </div>

            {violationCount > 0 && (
              <div className="modal-warning-note">
                ⚠️ Note: {violationCount} integrity flag(s) were recorded during this session.
              </div>
            )}

            <div className="modal-actions">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="btn btn-outline"
              >
                Continue Test
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="btn btn-dark"
              >
                Confirm & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
