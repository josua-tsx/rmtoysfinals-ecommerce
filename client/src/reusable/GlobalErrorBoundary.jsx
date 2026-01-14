import React from "react";

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fffdf6] flex items-center justify-center p-4 font-main">
          <div className="max-w-md w-full bg-white border-2 border-black p-8 rounded-[10px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center">
            <div className="text-6xl mb-4">😵</div>
            <h1 className="text-2xl font-black uppercase tracking-widest mb-2">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-6 font-bold uppercase text-xs tracking-tight">
              An unexpected error has occurred. We&apos;ve been notified and are
              looking into it.
            </p>
            <div className="flex flex-col gap-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-indigo-600 text-white border border-black py-3 px-6 rounded-[5px] font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                Refresh Page
              </button>
              <a
                href="/"
                className="w-full bg-white text-black border border-black py-3 px-6 rounded-[5px] font-black uppercase text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                Back to Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
