import React, { Component } from "react";

// ─── Pre-flight check — avoids throwing a WebGL error into Vite's dev overlay ─
export function isWebGLAvailable(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

interface EBState { err: string | null }

export class WebGLErrorBoundary extends Component<{ children: React.ReactNode }, EBState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { err: null };
  }
  static getDerivedStateFromError(e: Error): EBState {
    return { err: e.message };
  }
  render() {
    if (this.state.err) {
      return (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#060402] gap-3">
          <div className="text-[#4a3820] text-[11px] uppercase tracking-wider">3D Preview Unavailable</div>
          <div className="text-[#3a3010] text-[9px] text-center max-w-[240px] leading-relaxed">
            WebGL is not supported or disabled in this browser.<br />
            Code export still works normally.
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
