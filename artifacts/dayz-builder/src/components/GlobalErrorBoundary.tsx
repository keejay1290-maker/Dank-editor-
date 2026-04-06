import React from "react";

/**
 * 🛡️ GLOBAL ERROR BOUNDARY
 * Prevents "White Screen of Death" by catching runtime crashes and displaying a diagnostic interface.
 */
export class GlobalErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message?: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, message: error?.message || "Unknown error" };
  }

  componentDidCatch(error: any, info: any) {
    console.error("[GLOBAL_ERROR_BOUNDARY] UNCAUGHT CRASH:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
            padding: "24px", 
            color: "#e74c3c", 
            fontFamily: "monospace", 
            backgroundColor: "#0d0d0d",
            height: "100vh",
            border: "2px solid #e74c3c"
        }}>
          <h2 style={{ letterSpacing: "2px", textTransform: "uppercase" }}>⚠️ DankVault™ CRITICAL CRASH</h2>
          <div style={{ margin: "20px 0", padding: "16px", backgroundColor: "#1a0a0a", borderLeft: "4px solid #e74c3c" }}>
            <strong>Error Trace:</strong>
            <p style={{ marginTop: "8px", fontSize: "14px" }}>{this.state.message}</p>
          </div>
          <p style={{ opacity: 0.6 }}>Check recent changes to shape registry, pipeline context, or 3D preview logic.</p>
          <button 
            onClick={() => window.location.reload()}
            style={{ 
                marginTop: "20px", 
                padding: "10px 20px", 
                backgroundColor: "#e74c3c", 
                color: "white", 
                border: "none", 
                cursor: "pointer",
                fontWeight: "bold"
            }}
          >
            RELOAD INTERFACE
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
