import { useEffect, useRef, useState } from "react";
import CameraMonitor from "./components/CameraMonitor";
import SetupScreen from "./components/SetupScreen";
import ExamScreen from "./components/ExamScreen";
import ResultScreen from "./components/ResultScreen";
import { MOCK_QUESTIONS } from "./data/mockQuestions";
import "./App.css";

// Exam stages: "setup" -> "in-progress" -> "completed"
const STAGES = {
  SETUP: "setup",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
};

export default function App() {
  const [stage, setStage] = useState(STAGES.SETUP);
  const [cameraReady, setCameraReady] = useState(false);
  const [fullscreenReady, setFullscreenReady] = useState(false);
  const [remainingTime, setRemainingTime] = useState(60 * 60 * 1000); // 60 minutes
  const [userAnswers, setUserAnswers] = useState({});
  const [violations, setViolations] = useState([]);
  const [terminationReason, setTerminationReason] = useState(null);

  const cameraMonitorRef = useRef(null);

  // Sync remaining time when exam is in progress
  useEffect(() => {
    if (stage !== STAGES.IN_PROGRESS) return;

    async function updateTime() {
      if (window.electronAPI?.getRemainingTime) {
        const ms = await window.electronAPI.getRemainingTime();
        if (typeof ms === "number" && !isNaN(ms)) {
          if (ms <= 0) {
            setRemainingTime(0);
            handleEndExam("Exam time expired (60 minutes completed).");
            return;
          }
          setRemainingTime(ms);
          return;
        }
      }

      // Fallback local countdown if running in normal web browser
      setRemainingTime((prev) => {
        if (prev <= 1000) {
          handleEndExam("Exam time expired (60 minutes completed).");
          return 0;
        }
        return prev - 1000;
      });
    }

    const intervalId = setInterval(updateTime, 1000);
    return () => clearInterval(intervalId);
  }, [stage]);

  // Request camera access via CameraMonitor ref
  async function handleRequestCamera() {
    if (cameraMonitorRef.current) {
      const granted = await cameraMonitorRef.current.requestCamera();
      setCameraReady(Boolean(granted));
    }
  }

  // Request fullscreen mode (Electron kiosk or Browser Fullscreen API)
  async function handleRequestFullscreen() {
    try {
      if (window.electronAPI?.setFullScreen) {
        await window.electronAPI.setFullScreen();
      } else if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      setFullscreenReady(true);
    } catch (err) {
      console.warn("Fullscreen request error:", err);
      // Still mark ready so the student isn't blocked
      setFullscreenReady(true);
    }
  }

  // Show exam rules dialog and transition to exam stage
  async function handleStartExam() {
    if (!cameraReady) {
      alert("Please configure and allow camera access before starting the test.");
      return;
    }

    if (window.electronAPI?.showExamRules) {
      const response = await window.electronAPI.showExamRules();
      // In Electron dialog: 0 is "Cancel", 1 is "Accept"
      if (response === 0) {
        return;
      }
    }

    if (window.electronAPI?.startTest) {
      await window.electronAPI.startTest();
    }

    setStage(STAGES.IN_PROGRESS);
  }

  // Select an option for a question
  function handleSelectAnswer(questionIndex, optionIndex) {
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  }

  // Clear answer for a question
  function handleClearAnswer(questionIndex) {
    setUserAnswers((prev) => {
      const next = { ...prev };
      delete next[questionIndex];
      return next;
    });
  }

  // Record proctoring violations
  function handleRecordViolations(records) {
    setViolations(records);
  }

  // Conclude the exam
  function handleEndExam(reason = null) {
    if (reason) {
      setTerminationReason(reason);
    }
    setStage(STAGES.COMPLETED);

    // Save session logs via Electron IPC
    if (window.electronAPI?.saveLog) {
      window.electronAPI.saveLog({
        sessionId: `athena-${Date.now()}`,
        submittedAt: new Date().toISOString(),
        terminationReason: reason,
        answers: userAnswers,
        violationsCount: violations.length,
        violationsList: violations,
      });
    }
  }

  // Reset back to setup screen
  function handleRestart() {
    setStage(STAGES.SETUP);
    setUserAnswers({});
    setViolations([]);
    setTerminationReason(null);
    setRemainingTime(60 * 60 * 1000);
  }

  // Format milliseconds into HH:MM:SS
  function formatTimeLeft(ms) {
    if (ms <= 0 || isNaN(ms)) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const seconds = Math.floor(totalSeconds % 60)
      .toString()
      .padStart(2, "0");

    return `${hours}:${minutes}:${seconds}`;
  }

  return (
    <>
      {/* Background camera streamer & automated snapshot taker */}
      <CameraMonitor
        ref={cameraMonitorRef}
        isSetupStage={stage === STAGES.SETUP}
        isExamStage={stage === STAGES.IN_PROGRESS}
        onCameraReady={setCameraReady}
      />

      {/* Stage 1: Setup & Permissions */}
      {stage === STAGES.SETUP && (
        <SetupScreen
          cameraReady={cameraReady}
          onRequestCamera={handleRequestCamera}
          fullscreenReady={fullscreenReady}
          onRequestFullscreen={handleRequestFullscreen}
          onStartExam={handleStartExam}
        />
      )}

      {/* Stage 2: Active Exam Screen with Proctoring & Security */}
      {stage === STAGES.IN_PROGRESS && (
        <ExamScreen
          questions={MOCK_QUESTIONS}
          answers={userAnswers}
          onSelectAnswer={handleSelectAnswer}
          onClearAnswer={handleClearAnswer}
          remainingTime={remainingTime}
          formatTimeLeft={formatTimeLeft}
          onEndExam={handleEndExam}
          onRecordViolations={handleRecordViolations}
        />
      )}

      {/* Stage 3: Results / Completed Screen with Proctoring Report */}
      {stage === STAGES.COMPLETED && (
        <ResultScreen
          questions={MOCK_QUESTIONS}
          answers={userAnswers}
          violations={violations}
          terminationReason={terminationReason}
          onRestart={handleRestart}
        />
      )}
    </>
  );
}
