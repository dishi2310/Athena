/**
 * QuestionPalette component provides a quick visual map of all questions,
 * their current status (Answered, Marked for Review, Unanswered, Current),
 * and allows one-click jumping to any question.
 */
export default function QuestionPalette({
  totalQuestions,
  currentIndex,
  answers,
  reviewSet,
  onSelectQuestion,
}) {
  const answeredCount = Object.keys(answers).length;
  const reviewCount = reviewSet.size;
  const remainingCount = totalQuestions - answeredCount;

  return (
    <div className="palette-card">
      <div className="palette-header">
        <h4>Question Overview</h4>
        <div className="palette-summary-chips">
          <span className="summary-chip chip-answered">
            {answeredCount} Answered
          </span>
          <span className="summary-chip chip-review">
            {reviewCount} Review
          </span>
          <span className="summary-chip chip-remaining">
            {remainingCount} Left
          </span>
        </div>
      </div>

      {/* Grid of question numbers */}
      <div className="palette-grid">
        {Array.from({ length: totalQuestions }, (_, index) => {
          const isCurrent = index === currentIndex;
          const isAnswered = answers[index] !== undefined;
          const isReview = reviewSet.has(index);

          let statusClass = "palette-chip-unanswered";
          if (isAnswered) statusClass = "palette-chip-answered";
          if (isReview) statusClass = "palette-chip-review";
          if (isAnswered && isReview) statusClass = "palette-chip-answered-review";
          if (isCurrent) statusClass += " palette-chip-current";

          return (
            <button
              key={index}
              onClick={() => onSelectQuestion(index)}
              className={`palette-chip ${statusClass}`}
              title={`Question ${index + 1}: ${
                isReview
                  ? "Marked for Review"
                  : isAnswered
                  ? "Answered"
                  : "Not Answered"
              }`}
            >
              {index + 1}
              {isReview && <span className="review-dot" />}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="palette-legend">
        <div className="legend-item">
          <span className="legend-dot dot-answered" />
          <span>Answered</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot dot-review" />
          <span>Marked</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot dot-unanswered" />
          <span>Unanswered</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot dot-current" />
          <span>Current</span>
        </div>
      </div>
    </div>
  );
}
