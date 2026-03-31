import { createRoot } from "react-dom/client";
import { Component, ErrorInfo, ReactNode, useState, useEffect } from "react";
import { Router, Route, Switch } from "wouter";
import App from "./App";
import HomePage from "./HomePage";
import DankTypesEditor from "./tools/DankTypesEditor";
import DankLoadoutBuilder from "./tools/DankLoadoutBuilder";
import DankWeatherGenerator from "./tools/DankWeatherGenerator";
import DankGlobalsGenerator from "./tools/DankGlobalsGenerator";
import DankGameplayConfig from "./tools/DankGameplayConfig";
import DankCoordsTool from "./tools/DankCoordsTool";
import DankSpawnMaker from "./tools/DankSpawnMaker";
import DankRelocator from "./tools/DankRelocator";
import DankSplitter from "./tools/DankSplitter";
import DankValidator from "./tools/DankValidator";
import DankServerDNA from "./tools/DankServerDNA";
import DankMissionPackager from "./tools/DankMissionPackager";
import DankLootBalancer from "./tools/DankLootBalancer";
import DankTimeline from "./tools/DankTimeline";
import DankClassnameSearch from "./tools/DankClassnameSearch";
import DankBasePlanner from "./tools/DankBasePlanner";
import DankNitradoHelper from "./tools/DankNitradoHelper";
import "./index.css";

// ─── Electron update notification banner ─────────────────────────────────────
// Only active when running inside Electron (window.electronAPI is injected by preload)
declare global {
  interface Window {
    electronAPI?: {
      platform: string;
      appVersion: string;
      onUpdateAvailable: (cb: (info: { version: string }) => void) => void;
      onUpdateDownloaded: (cb: (info: { version: string }) => void) => void;
      installUpdate: () => void;
    };
  }
}

function UpdateBanner() {
  const [state, setState] = useState<"idle" | "available" | "downloaded">("idle");
  const [version, setVersion] = useState("");

  useEffect(() => {
    if (!window.electronAPI) return;
    window.electronAPI.onUpdateAvailable(({ version: v }) => {
      setState("available");
      setVersion(v);
    });
    window.electronAPI.onUpdateDownloaded(({ version: v }) => {
      setState("downloaded");
      setVersion(v);
    });
  }, []);

  if (state === "idle") return null;

  return (
    <div style={{
      position: "fixed", bottom: 16, right: 16, zIndex: 9999,
      background: state === "downloaded" ? "#27ae60" : "#d4a017",
      color: "#0a0804", fontFamily: "monospace", fontSize: 11,
      fontWeight: "bold", padding: "8px 14px", borderRadius: 3,
      display: "flex", alignItems: "center", gap: 10,
      boxShadow: "0 2px 12px rgba(0,0,0,0.6)",
    }}>
      {state === "downloaded"
        ? `✓ v${version} ready — installs on next restart`
        : `⬇ Downloading update v${version}…`}
      {state === "downloaded" && (
        <button
          onClick={() => window.electronAPI?.installUpdate()}
          style={{
            background: "#0a0804", color: "#27ae60", border: "none",
            padding: "3px 10px", fontFamily: "monospace", fontSize: 10,
            fontWeight: "bold", cursor: "pointer", borderRadius: 2,
          }}
        >
          Restart now
        </button>
      )}
    </div>
  );
}

// Suppress the "ResizeObserver loop limit exceeded" non-error that browsers
// emit as a non-Error object — Replit's sandbox catches it and reports a crash,
// but it is a benign browser warning, not an actual app failure.
const _origError = window.onerror;
window.onerror = (msg, src, line, col, err) => {
  if (typeof msg === "string" && msg.includes("ResizeObserver loop")) return true;
  return _origError ? _origError(msg, src, line, col, err) : false;
};
window.addEventListener("error", e => {
  if (e.message && e.message.includes("ResizeObserver loop")) { e.stopImmediatePropagation(); e.preventDefault(); }
}, true);

class ErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null };
  static getDerivedStateFromError(err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { error: msg };
  }
  componentDidCatch(err: unknown, info: ErrorInfo) {
    console.error("[Dank's Dayz Studio] Render error:", err, info.componentStack);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ fontFamily: "monospace", background: "#0a0804", color: "#c0392b", padding: 32, height: "100vh" }}>
          <div style={{ color: "#d4a017", fontWeight: "bold", fontSize: 18, marginBottom: 16 }}>⚠ Dank's Dayz Studio — Render Error</div>
          <pre style={{ color: "#c8b99a", fontSize: 12 }}>{this.state.error}</pre>
          <button onClick={() => this.setState({ error: null })}
            style={{ marginTop: 24, padding: "8px 24px", background: "#d4a017", color: "#0a0804", fontWeight: "bold", border: "none", cursor: "pointer" }}>
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <Router>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/editor" component={App} />
        <Route path="/types" component={DankTypesEditor} />
        <Route path="/loadout" component={DankLoadoutBuilder} />
        <Route path="/weather" component={DankWeatherGenerator} />
        <Route path="/globals" component={DankGlobalsGenerator} />
        <Route path="/gameplay" component={DankGameplayConfig} />
        <Route path="/coords" component={DankCoordsTool} />
        <Route path="/spawns" component={DankSpawnMaker} />
        <Route path="/relocator" component={DankRelocator} />
        <Route path="/splitter" component={DankSplitter} />
        <Route path="/validator" component={DankValidator} />
        <Route path="/dna" component={DankServerDNA} />
        <Route path="/packager" component={DankMissionPackager} />
        <Route path="/lootbalancer" component={DankLootBalancer} />
        <Route path="/timeline" component={DankTimeline} />
        <Route path="/classnames" component={DankClassnameSearch} />
        <Route path="/baseplanner" component={DankBasePlanner} />
        <Route path="/nitrado" component={DankNitradoHelper} />
        <Route component={HomePage} />
      </Switch>
    </Router>
    <UpdateBanner />
  </ErrorBoundary>
);
