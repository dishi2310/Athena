import { useState } from "react";

// Initial sample question set for Step 1
const SAMPLE_QUESTIONS = [
  {
    id: 1,
    question: "What is the primary role of the Main process in an Electron desktop application?",
    options: [
      "Rendering UI elements and handling CSS animations",
      "Managing native application lifecycle and creating BrowserWindows",
      "Parsing client-side JSX templates in real time",
      "Handling local browser storage and cookies only",
    ],
  },
  {
    id: 2,
    question: "Which Electron feature is used to securely expose Node APIs to the frontend renderer?",
    options: [
      "remote module",
      "contextBridge with preload scripts",
      "eval() function",
      "window.postMessage only",
    ],
  },
  {
    id: 3,
    question: "In React, what hook is used to perform side effects like starting a timer or webcam feed?",
    options: ["useState", "useMemo", "useEffect", "useCallback"],
  },
];

/**
 * ExamScreen component renders the active test environment,
 * question cards, options, navigation buttons, and countdown timer.
 */
export default function ExamScreen({
  remainingTime,
  formatTimeLeft,
  onEndExam,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  const currentQuestion = SAMPLE_QUESTIONS[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === SAMPLE_QUESTIONS.length - 1;

  function handleOptionSelect(optionIndex) {
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: optionIndex,
    }));
  }

  function handleNext() {
    if (isLast) {
      onEndExam();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }

  function handlePrev() {
    if (!isFirst) {
      setCurrentIndex((prev) => prev - 1);
    }
  }

  return (
    <div className="exam-page">
      <div className="exam-container">
        {/* Header with timer and End Test button */}
        <div className="exam-header">
          <h3>Time Left: {formatTimeLeft(remainingTime)}</h3>
          <button onClick={onEndExam} className="end-test-btn">
            End Test
          </button>
        </div>

        {/* Question Card */}
        <div className="question-card">
          <h2>
            Question {currentIndex + 1} of {SAMPLE_QUESTIONS.length}
          </h2>
          <p>{currentQuestion.question}</p>

          <div className="options-container">
            {currentQuestion.options.map((option, idx) => {
              const isChecked = answers[currentIndex] === idx;
              return (
                <label key={idx} className="option-row">
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={idx}
                    checked={isChecked}
                    onChange={() => handleOptionSelect(idx)}
                  />
                  <span>{option}</span>
                </label>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="navigation-buttons">
            <button onClick={handlePrev} disabled={isFirst}>
              Previous
            </button>
            <button onClick={handleNext}>
              {isLast ? "Submit Exam" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
