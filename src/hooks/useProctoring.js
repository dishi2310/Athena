import { useEffect, useRef, useState, useCallback } from "react";

const MAX_WARNINGS = 3;

/**
 * useProctoring hook monitors the testing session for anti-cheating violations:
 * - Window blur and document visibility changes (Alt-Tab, window switching)
 * - Right-click context menu attempts
 * - Keyboard shortcuts (copy, paste, cut, inspect element, refresh)
 * - Clipboard copying and pasting
 */
export default function useProctoring({
  isActive,
  onMaxViolationsExceeded,
}) {
  const [violations, setViolations] = useState([]);
  const [activeWarning, setActiveWarning] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const toastTimerRef = useRef(null);
  const lastBlurTimestampRef = useRef(0);

  // Show a temporary unobtrusive notification for minor blocked actions (e.g. right-click, copy)
  const showToast = useCallback((message) => {
    setToastMessage(message);
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  // Record an integrity violation (focus loss / tab switch)
  const recordViolation = useCallback(
    (type, reason) => {
      if (!isActive) return;

      const now = Date.now();
      // Debounce window blur events (prevent multiple triggers for the same switch within 1.5s)
      if (now - lastBlurTimestampRef.current < 1500) {
        return;
      }
      lastBlurTimestampRef.current = now;

      const violationRecord = {
        id: now,
        timestamp: new Date(now).toLocaleTimeString(),
        type,
        reason,
      };

      setViolations((prev) => {
        const updated = [...prev, violationRecord];
        const count = updated.length;

        // Set active warning dialog
        setActiveWarning({
          count,
          max: MAX_WARNINGS,
          remaining: Math.max(0, MAX_WARNINGS - count),
          reason,
        });

        // If max violations reached, trigger auto-submit
        if (count >= MAX_WARNINGS) {
          if (onMaxViolationsExceeded) {
            onMaxViolationsExceeded(updated);
          }
        }

        return updated;
      });
    },
    [isActive, onMaxViolationsExceeded]
  );

  // Dismiss warning dialog
  const dismissWarning = useCallback(() => {
    setActiveWarning(null);
  }, []);

  useEffect(() => {
    if (!isActive) return;

    // 1. Window Blur (Alt-Tab / switching to another app)
    function handleWindowBlur() {
      recordViolation(
        "Window Focus Lost",
        "You clicked outside or navigated away from the exam window (Alt+Tab / App Switch)."
      );
    }

    // 2. Document Visibility Change (minimized window or switched tabs)
    function handleVisibilityChange() {
      if (document.hidden) {
        recordViolation(
          "Window Minimized",
          "The exam screen was minimized or put in the background."
        );
      }
    }

    // 3. Prevent Right-Click Context Menu
    function handleContextMenu(e) {
      e.preventDefault();
      showToast("⚠️ Right-click context menu is disabled during the exam.");
    }

    // 4. Prevent Copy, Cut, Paste
    function handleCopy(e) {
      e.preventDefault();
      showToast("⚠️ Copying text is strictly prohibited.");
    }

    function handleCut(e) {
      e.preventDefault();
      showToast("⚠️ Cutting text is disabled during the exam.");
    }

    function handlePaste(e) {
      e.preventDefault();
      showToast("⚠️ Pasting content is not allowed.");
    }

    // 5. Block Restricted Keyboard Shortcuts
    function handleKeyDown(e) {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();

      // Block Developer Tools: F12, Ctrl+Shift+I, Cmd+Option+I, Cmd+Shift+C
      if (
        e.key === "F12" ||
        (isCmdOrCtrl && e.shiftKey && (key === "i" || key === "c" || key === "j")) ||
        (e.metaKey && e.altKey && (key === "i" || key === "j"))
      ) {
        e.preventDefault();
        showToast("⚠️ Developer tools and element inspection are disabled.");
        return;
      }

      // Block Page Refresh: F5, Ctrl+R, Cmd+R
      if (e.key === "F5" || (isCmdOrCtrl && key === "r")) {
        e.preventDefault();
        showToast("⚠️ Refreshing the exam page is disabled.");
        return;
      }

      // Block Copy/Paste shortcuts: Ctrl+C, Cmd+C, Ctrl+V, Cmd+V, Ctrl+X, Cmd+X
      if (isCmdOrCtrl && (key === "c" || key === "v" || key === "x" || key === "a")) {
        // Allow select-all only if inside an input/textarea if needed, otherwise block
        if (key === "c" || key === "v" || key === "x") {
          e.preventDefault();
          showToast(`⚠️ Keyboard shortcut ${e.metaKey ? "Cmd" : "Ctrl"}+${key.toUpperCase()} is disabled.`);
        }
      }
    }

    // Attach security listeners
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("cut", handleCut);
    document.addEventListener("paste", handlePaste);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("paste", handlePaste);
      window.removeEventListener("keydown", handleKeyDown);
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, [isActive, recordViolation, showToast]);

  return {
    violations,
    violationCount: violations.length,
    activeWarning,
    toastMessage,
    dismissWarning,
    maxWarnings: MAX_WARNINGS,
  };
}
