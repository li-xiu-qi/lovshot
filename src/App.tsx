import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { register, unregister } from "@tauri-apps/plugin-global-shortcut";
import "./App.css";

interface RecordingState {
  is_recording: boolean;
  frame_count: number;
}

function App() {
  const [isRecording, setIsRecording] = useState(false);
  const [frameCount, setFrameCount] = useState(0);
  const [savedPath, setSavedPath] = useState("");
  const [fps, setFps] = useState(10);

  useEffect(() => {
    const unlisten = listen<RecordingState>("recording-state", (event) => {
      setIsRecording(event.payload.is_recording);
      setFrameCount(event.payload.frame_count);
    });

    // Register global shortcut
    register("CommandOrControl+Shift+G", async () => {
      if (!isRecording) {
        await invoke("open_selector");
        setIsRecording(true);
        setSavedPath("");
      }
    }).catch(console.error);

    return () => {
      unlisten.then((fn) => fn());
      unregister("CommandOrControl+Shift+G").catch(console.error);
    };
  }, [isRecording]);

  const handleStartCapture = async () => {
    setSavedPath("");
    await invoke("open_selector");
  };

  const handleStopRecording = async () => {
    await invoke("stop_recording");
    setIsRecording(false);
    try {
      const path = await invoke<string>("save_gif");
      setSavedPath(path);
    } catch (e) {
      console.error("Failed to save GIF:", e);
    }
    setFrameCount(0);
  };

  const handleFpsChange = async (newFps: number) => {
    setFps(newFps);
    await invoke("set_fps", { fps: newFps });
  };

  return (
    <main className="container">
      <h1>lovshot</h1>
      <p className="subtitle">GIF Screen Recorder</p>

      <div className="controls">
        <div className="fps-control">
          <label>FPS: {fps}</label>
          <input
            type="range"
            min="5"
            max="30"
            value={fps}
            onChange={(e) => handleFpsChange(Number(e.target.value))}
            disabled={isRecording}
          />
        </div>

        {!isRecording ? (
          <button className="btn-primary" onClick={handleStartCapture}>
            Start Capture
          </button>
        ) : (
          <button className="btn-stop" onClick={handleStopRecording}>
            Stop Recording ({frameCount} frames)
          </button>
        )}
      </div>

      <p className="shortcut-hint">
        Shortcut: <kbd>Cmd/Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>G</kbd>
      </p>

      {savedPath && (
        <div className="saved-info">
          <p>Saved to:</p>
          <code>{savedPath}</code>
        </div>
      )}
    </main>
  );
}

export default App;
