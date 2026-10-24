import { forwardRef, useImperativeHandle, useEffect, useRef, useState } from "react";

/**
 * CameraMonitor component handles webcam stream initialization,
 * live preview during setup, hidden background stream during the exam,
 * and automated periodic snapshot capture for proctoring.
 */
const CameraMonitor = forwardRef(function CameraMonitor(
  { isExamStage, isSetupStage, onCameraReady },
  ref
) {
  const videoRef = useRef(null);
  const imageCaptureRef = useRef(null);
  const streamRef = useRef(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  // Request webcam access from the browser/Electron
  async function requestCamera() {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const track = stream.getVideoTracks()[0];
      if (typeof window !== "undefined" && "ImageCapture" in window) {
        imageCaptureRef.current = new window.ImageCapture(track);
      }

      setHasCamera(true);
      if (onCameraReady) {
        onCameraReady(true);
      }
      return true;
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError(
        "Camera permission was denied or camera is not available. Please allow access."
      );
      if (onCameraReady) {
        onCameraReady(false);
      }
      return false;
    }
  }

  // Expose camera methods to parent component
  useImperativeHandle(ref, () => ({
    requestCamera,
    hasCamera,
  }));

  // Periodic photo capture during the exam (every 5 seconds)
  useEffect(() => {
    if (!isExamStage || !hasCamera) return;

    async function takeSnapshot() {
      try {
        let buffer;

        if (imageCaptureRef.current) {
          const blob = await imageCaptureRef.current.takePhoto();
          buffer = await blob.arrayBuffer();
        } else if (videoRef.current) {
          // Fallback: draw video frame to an offscreen canvas
          const video = videoRef.current;
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 480;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const blob = await new Promise((resolve) =>
            canvas.toBlob(resolve, "image/jpeg", 0.8)
          );
          if (blob) {
            buffer = await blob.arrayBuffer();
          }
        }

        if (buffer && window.electronAPI?.savePhoto) {
          await window.electronAPI.savePhoto(buffer);
        }
      } catch (err) {
        console.warn("Proctoring snapshot warning:", err);
      }
    }

    const intervalId = setInterval(takeSnapshot, 5000);
    return () => clearInterval(intervalId);
  }, [isExamStage, hasCamera]);

  // Clean up media tracks when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={hasCamera && isSetupStage ? "video-preview" : "hidden-video"}
      />
      {cameraError && (
        <div style={{ color: "#d93025", fontSize: "14px", marginTop: "8px" }}>
          {cameraError}
        </div>
      )}
    </>
  );
});

export default CameraMonitor;
