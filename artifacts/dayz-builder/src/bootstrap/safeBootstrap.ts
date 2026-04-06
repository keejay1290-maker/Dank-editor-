/**
 * 🛡️ SAFE BOOTSTRAP WRAPPER (WHITE-SCREEN PROTECTION)
 * Intercepts any fatal exceptions during the application's initialization sequence.
 * Prevents the "white screen of death" before React has a chance to mount its Error Boundary.
 */

function showFatalErrorScreen(err: any) {
  const root = document.getElementById("root");
  if (!root) return;

  root.innerHTML = `
    <div style="padding:24px;color:#e74c3c;font-family:monospace;background:#0d0d0d;height:100vh;overflow:auto;">
      <h2 style="border-bottom:2px solid #e74c3c;padding-bottom:10px;">DankVault™ Fatal Error</h2>
      <p style="color:#d4a017;font-weight:bold;">A critical initialization failure has occurred.</p>
      <pre style="background:#1a1a1a;padding:15px;border-radius:5px;border:1px solid #333;white-space:pre-wrap;word-break:break-all;">${err?.message || err || "Unknown error"}</pre>
      <p style="color:#555;">Check Desktop/copilot for the latest diagnostic summary.</p>
      <button onclick="window.location.reload()" style="background:#e74c3c;color:#fff;border:none;padding:10px 20px;cursor:pointer;font-weight:bold;margin-top:10px;">RELOAD SYSTEM</button>
    </div>
  `;
}

export function safeBootstrap(fn: () => void) {
  try {
    // 🎧 Global Error Listeners
    window.addEventListener("error", (e) => showFatalErrorScreen(e.error));
    window.addEventListener("unhandledrejection", (e) => showFatalErrorScreen(e.reason));

    fn();
  } catch (err) {
    console.error("[BOOTSTRAP_FATAL]", err);
    showFatalErrorScreen(err);
  }
}
