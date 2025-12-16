import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { listen } from "@tauri-apps/api/event";
import { save } from "@tauri-apps/plugin-dialog";
import "./scroll-overlay.css";

interface ScrollCaptureProgress {
  frame_count: number;
  total_height: number;
  preview_base64: string;
}

export default function ScrollOverlay() {
  const [progress, setProgress] = useState<ScrollCaptureProgress | null>(null);
  const [isStopped, setIsStopped] = useState(false);

  // Poll for scroll changes
  useEffect(() => {
    if (isStopped) return;

    let isCapturing = false;
    const POLL_INTERVAL = 200;

    const pollCapture = async () => {
      if (isCapturing) return;
      isCapturing = true;
      try {
        const result = await invoke<ScrollCaptureProgress | null>("capture_scroll_frame_auto");
        if (result) setProgress(result);
      } catch {
        // ignore
      } finally {
        isCapturing = false;
      }
    };

    invoke<ScrollCaptureProgress>("get_scroll_preview")
      .then(setProgress)
      .catch(() => {});

    const intervalId = setInterval(pollCapture, POLL_INTERVAL);
    return () => clearInterval(intervalId);
  }, [isStopped]);

  // Listen for shortcut to stop
  useEffect(() => {
    const unlisten = listen("scroll-capture-stop", () => {
      setIsStopped(true);
    });
    return () => { unlisten.then(fn => fn()); };
  }, []);

  const handleStop = () => {
    setIsStopped(true);
  };

  const handleFinish = async () => {
    console.log("[ScrollOverlay] handleFinish called");
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const filePath = await save({
        defaultPath: `scroll_${timestamp}.png`,
        filters: [{ name: "PNG Image", extensions: ["png"] }],
      });

      if (!filePath) {
        console.log("[ScrollOverlay] save cancelled");
        return;
      }

      await getCurrentWindow().hide();
      await invoke<string>("finish_scroll_capture", { path: filePath });
      console.log("[ScrollOverlay] saved to:", filePath);
      await getCurrentWindow().destroy();
    } catch (e) {
      console.error("[ScrollOverlay] handleFinish error:", e);
    }
  };

  const handleCopy = async () => {
    try {
      await invoke("copy_scroll_to_clipboard");
    } catch (e) {
      console.error("[ScrollOverlay] copy error:", e);
    }
  };

  const handleCancel = async () => {
    try {
      await invoke("cancel_scroll_capture");
    } catch (e) {
      console.error("[ScrollOverlay] handleCancel error:", e);
    }
    await getCurrentWindow().destroy();
  };

  return (
    <div className="scroll-overlay-container">
      <div className="scroll-overlay-header">
        <span>{isStopped ? "Done" : "Capturing"}</span>
        {progress && (
          <span className="scroll-overlay-stats">
            {progress.frame_count}f · {progress.total_height}px
          </span>
        )}
      </div>

      <div className="scroll-overlay-preview">
        {progress && <img src={progress.preview_base64} alt="" />}
      </div>

      <div className="scroll-overlay-actions">
        {!isStopped ? (
          <button className="btn-stop" onClick={handleStop}>Stop</button>
        ) : (
          <>
            <button className="btn-copy" onClick={handleCopy}>Copy</button>
            <button className="btn-save" onClick={handleFinish}>Save</button>
            <button className="btn-cancel" onClick={handleCancel}>Cancel</button>
          </>
        )}
      </div>
    </div>
  );
}
