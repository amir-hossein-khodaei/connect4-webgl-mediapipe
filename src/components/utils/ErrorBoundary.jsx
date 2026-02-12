import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("3D Context Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#0a1a2a] text-center p-8">
          <div className="border border-red-500/50 bg-red-900/20 p-6 rounded-lg max-w-lg">
            <h2 className="text-[#ffd700] text-xl font-bold mb-2">The Scrying Glass is Broken</h2>
            <p className="text-red-300 text-sm mb-4">
              A graphical error prevented the world from loading.
            </p>
            <p className="text-xs text-gray-400 font-mono bg-black/50 p-2 rounded mb-4">
              {this.state.error?.message}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-[#aaccff] text-[#aaccff] hover:bg-[#aaccff]/10 uppercase text-xs tracking-widest"
            >
              Reload Ritual
            </button>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;