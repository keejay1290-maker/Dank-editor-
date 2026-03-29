import { createRoot } from "react-dom/client";
import { Component, ErrorInfo, ReactNode } from "react";
import App from "./App";
import "./index.css";

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
    console.error("[DankDayZ] Render error:", err, info.componentStack);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ fontFamily: "monospace", background: "#0a0804", color: "#c0392b", padding: 32, height: "100vh" }}>
          <div style={{ color: "#d4a017", fontWeight: "bold", fontSize: 18, marginBottom: 16 }}>⚠ DankDayZ — Render Error</div>
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
    <App />
  </ErrorBoundary>
);
