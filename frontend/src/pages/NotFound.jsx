import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ArrowLeft, Brain, Compass, LayoutDashboard } from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary flex flex-col justify-between relative overflow-hidden transition-colors duration-200">
      {/* Background glow effects */}
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="absolute bottom-1/4 right-1/4 w-[360px] h-[360px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)' }}
        />
      </div>

      {/* Top Header */}
      <header className="relative z-10 max-w-6xl w-full mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center transition-transform group-hover:scale-105">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm tracking-tight text-text-primary">
            InterviewSense
          </span>
        </Link>
        <ThemeToggle id="theme-toggle-404" />
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="glass-card max-w-lg w-full p-8 sm:p-10 text-center relative"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              color: '#818CF8'
            }}
          >
            <Compass className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
            <span>404 Error • Route Not Found</span>
          </div>

          {/* Big numeric indicator */}
          <h1 className="text-7xl sm:text-8xl font-black tracking-tight mb-3 gradient-text-brand select-none leading-none">
            404
          </h1>

          <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-3">
            Lost in preparation?
          </h2>

          <p className="text-text-secondary text-sm leading-relaxed mb-8 max-w-sm mx-auto">
            The page or interview session you're looking for doesn't exist, has been moved, or the link has expired.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              id="btn-404-home"
              className="btn-primary w-full sm:w-auto px-6 py-3 text-sm font-semibold justify-center shadow-lg shadow-indigo-500/25"
            >
              <Home className="w-4 h-4" />
              Back to Home
            </Link>

            <Link
              to="/dashboard"
              id="btn-404-dashboard"
              className="btn-secondary w-full sm:w-auto px-6 py-3 text-sm font-semibold justify-center"
            >
              <LayoutDashboard className="w-4 h-4" />
              Go to Dashboard
            </Link>

            <button
              type="button"
              id="btn-404-back"
              onClick={() => navigate(-1)}
              className="btn-secondary w-full sm:w-auto px-4 py-3 text-sm font-semibold justify-center sm:hidden"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous Page
            </button>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-text-muted">
        © {new Date().getFullYear()} InterviewSense. All rights reserved.
      </footer>
    </div>
  )
}
