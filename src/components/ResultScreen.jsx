import { useState } from "react";
import { MOCK_QUESTIONS } from "../data/mockQuestions";

/**
 * ResultScreen component evaluates the student's answers,
 * calculates score and accuracy, and provides an itemized answer review.
 */
export default function ResultScreen({
  questions = MOCK_QUESTIONS,
  answers = {},
  onRestart,
}) {
  const [showReview, setShowReview] = useState(false);

  const totalQuestions = questions.length;
  let correctCount = 0;
  let incorrectCount = 0;

  questions.forEach((q, idx) => {
    const userChoice = answers[idx];
    if (userChoice !== undefined) {
      if (userChoice === q.correctAnswer) {
        correctCount += 1;
      } else {
        incorrectCount += 1;
      }
    }
  });

  const unattemptedCount = totalQuestions - (correctCount + incorrectCount);
  const percentage = Math.round((correctCount / totalQuestions) * 100);
  const isPassed = percentage >= 60;

  return (
    <div className="page-container">
      <div className="header-section">
        <h1>Assessment Report</h1>
        <p>Review your exam performance and proctored submission summary.</p>
      </div>

      <div className="card-container result-card-main">
        {/* Score Banner */}
        <div className="result-score-banner">
          <div className="result-badge-icon">{isPassed ? "🎯" : "📝"}</div>
          <h2 className="result-score-title">
            Score: {correctCount} / {totalQuestions} ({percentage}%)
          </h2>
          <p className="result-score-subtitle">
            {isPassed
              ? "Congratulations! You successfully passed the assessment."
              : "Assessment submitted. Review the explanations below to improve."}
          </p>
        </div>

        {/* Metric Cards */}
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
            <span className="metric-label">Unattempted</span>
          </div>
          <div className="metric-box metric-accuracy">
            <span className="metric-number">{percentage}%</span>
            <span className="metric-label">Accuracy</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="result-actions">
          <button
            onClick={() => setShowReview((prev) => !prev)}
            className="btn btn-outline"
          >
            {showReview ? "Hide Question Review" : "Review All Questions & Answers"}
          </button>
          <button onClick={onRestart} className="btn btn-dark">
            Take Another Test
          </button>
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
                      Question {idx + 1}
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
