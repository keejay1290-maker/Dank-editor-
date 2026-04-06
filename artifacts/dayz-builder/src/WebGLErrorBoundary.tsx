import React, { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class WebGLErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("WebGL Pipeline Crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#080f09] text-[#e74c3c] font-mono border border-red-900/50 p-6">
          <div className="text-2xl mb-2">☢ WEBGL CONTEXT CRASH ☢</div>
          <p className="text-[10px] opacity-70 mb-4 max-w-sm text-center uppercase">
            The 3D rendering pipeline has exhausted GPU resources. This usually happens with massive instanced builds.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white text-[10px] font-black rounded hover:bg-red-500 transition-colors"
          >
            RECOVERY RELOAD
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}
