import React from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    if (this.props.onReset) {
      this.props.onReset()
    } else {
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6 text-text-primary">
          <div
            className="w-full max-w-md p-8 rounded-2xl glass-card text-center border border-red-500/20 shadow-2xl"
            style={{ background: 'var(--card-bg)' }}
          >
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h2 className="text-xl font-bold text-text-primary mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-text-secondary mb-6">
              We encountered an unexpected issue while loading this page. Don't worry, your interview progress and session history are safe.
            </p>

            {this.state.error?.message && (
              <div className="mb-6 p-3 rounded-xl bg-red-500/5 border border-red-500/15 text-left">
                <p className="text-[11px] font-mono text-red-400/90 break-words line-clamp-3">
                  {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={this.handleReset}
                className="btn-primary flex-1 justify-center py-3 text-xs font-semibold cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 mr-1.5" />
                Retry & Reload
              </button>
              <a
                href="/dashboard"
                className="btn-secondary flex-1 justify-center py-3 text-xs font-semibold cursor-pointer"
              >
                <Home className="w-4 h-4 mr-1.5" />
                Dashboard
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
