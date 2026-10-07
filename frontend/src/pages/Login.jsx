import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  X,
  CheckCircle,
  Target,
  Zap,
  BarChart2,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { resetPassword } from '../firebase'
import ThemeToggle from '../components/ThemeToggle'

// ── Animation Variants ─────────────────────────────────────────────────────────
const pageVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
}

const errorVariants = {
  hidden: { opacity: 0, y: -6, height: 0 },
  visible: { opacity: 1, y: 0, height: 'auto', transition: { duration: 0.25 } },
  exit: { opacity: 0, y: -4, height: 0, transition: { duration: 0.2 } },
}

// ── Friendly Firebase error map ────────────────────────────────────────────────
const friendlyError = (code) => {
  const map = {
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/popup-blocked': 'Popup blocked. Please allow popups for this site.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  }
  return map[code] || 'Something went wrong. Please try again.'
}

// ── Input field component ──────────────────────────────────────────────────────
function AuthInput({ id, name, type, placeholder, value, onChange, icon: Icon, rightSlot, autoComplete }) {
  const [focused, setFocused] = useState(false)
  return (
    <div
      className="relative flex items-center rounded-xl transition-all duration-200"
      style={{
        background: 'var(--pill-bg)',
        border: focused ? '1px solid #6366F1' : '1px solid var(--surface-border)',
        boxShadow: focused ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
      }}
    >
      <Icon className="absolute left-3.5 w-4 h-4 text-text-muted flex-shrink-0" />
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full pl-10 pr-10 py-3 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none"
      />
      {rightSlot && <div className="absolute right-3">{rightSlot}</div>}
    </div>
  )
}

// ── Forgot Password Modal ──────────────────────────────────────────────────────
function ForgotPasswordModal({ onClose }) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleReset = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 16 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm rounded-2xl p-6 relative"
        style={{ background: '#111118', border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-[#475569] hover:text-[#94A3B8] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {sent ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-base font-bold text-[#F8F8FF] mb-2">Check your inbox</h3>
            <p className="text-sm text-[#94A3B8]">
              We sent a reset link to <span className="text-[#F8F8FF]">{email}</span>
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 text-sm text-[#6366F1] hover:underline cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-base font-bold text-[#F8F8FF] mb-1">Reset password</h3>
            <p className="text-sm text-[#94A3B8] mb-5">Enter your email and we'll send a reset link.</p>
            <form onSubmit={handleReset} className="space-y-4">
              <AuthInput
                id="reset-email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
                icon={Mail}
                autoComplete="email"
              />
              {error && (
                <p className="text-xs text-red-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                  {error}
                </p>
              )}
              <button
                id="btn-send-reset"
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-2.5 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Send reset link'
                )}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

// ── Main Login Page ───────────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate()
  const { loginWithGoogle, loginWithEmail } = useAuth()

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showForgot, setShowForgot] = useState(false)

  const handleField = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    if (error) setError('')
  }

  const handleGoogle = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      await loginWithGoogle()
      navigate('/dashboard')
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await loginWithEmail(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="min-h-screen flex relative overflow-hidden bg-bg-primary text-text-primary transition-colors duration-200">
        <div className="absolute top-5 right-5 z-30">
          <ThemeToggle id="theme-toggle-login" />
        </div>
        {/* Left decorative panel (hidden on mobile) */}
        <div className="hidden lg:flex lg:w-[44%] xl:w-[48%] flex-col items-center justify-center relative p-12 overflow-hidden">
          {/* Ambient orbs */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full opacity-25 blur-3xl"
              style={{ background: 'radial-gradient(circle, #6366F1, transparent)' }}
            />
            <div
              className="absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full opacity-15 blur-3xl"
              style={{ background: 'radial-gradient(circle, #8B5CF6, transparent)' }}
            />
          </div>

          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(99,102,241,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.6) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />

          <div className="relative z-10 max-w-sm text-center">
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
                boxShadow: '0 0 40px rgba(99,102,241,0.4)',
              }}
            >
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-black text-text-primary mb-3 leading-tight">
              Your AI interview<br />coach awaits
            </h2>
            <p className="text-text-secondary text-sm leading-relaxed mb-8">
              Practice with real interview questions, get instant AI feedback, and track your improvement over time.
            </p>

            {/* Features bullet points with Lucide React icons */}
            <div className="flex flex-col gap-3">
              {[
                { icon: Target, text: 'Role-specific question banks' },
                { icon: Zap, text: 'Real-time AI feedback' },
                { icon: BarChart2, text: 'Detailed performance reports' },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-3 text-sm text-left border border-surface-border bg-surface"
                  style={{
                    borderRadius: '10px',
                    padding: '10px 14px',
                  }}
                >
                  <Icon className="w-4 h-4 text-[#8B5CF6] flex-shrink-0" />
                  <span className="text-text-secondary">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Auth form panel */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
          <motion.div variants={pageVariants} initial="hidden" animate="visible" className="w-full max-w-[400px]">
            {/* Logo — mobile only */}
            <div className="flex items-center gap-2.5 mb-8 lg:hidden">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}
              >
                <Brain className="w-4 h-4 text-white" />
              </div>
              <Link to="/" className="text-sm font-bold text-[#F8F8FF]">
                InterviewSense
                <span
                  style={{
                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {' '}AI
                </span>
              </Link>
            </div>

            {/* Heading */}
            <div className="mb-7">
              <h1 className="text-2xl font-black text-[#F8F8FF] mb-1.5">Welcome back</h1>
              <p className="text-sm text-[#94A3B8]">Sign in to continue your interview prep.</p>
            </div>

            {/* Google Button */}
            <button
              id="btn-google-signin"
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl mb-5 text-sm font-semibold transition-all duration-200 disabled:opacity-50 cursor-pointer border border-surface-border bg-surface hover:bg-surface-hover text-text-primary"
            >
              {googleLoading ? (
                <div className="w-4 h-4 border-2 border-brand-indigo border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continue with Google
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-surface-border" />
              <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">or with email</span>
              <div className="flex-1 h-px bg-surface-border" />
            </div>

            {/* Email form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="input-email" className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                  Email address
                </label>
                <AuthInput
                  id="input-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleField}
                  icon={Mail}
                  autoComplete="email"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="input-password" className="text-xs font-semibold text-[#94A3B8]">
                    Password
                  </label>
                  <button
                    type="button"
                    id="btn-forgot-password"
                    onClick={() => setShowForgot(true)}
                    className="text-xs text-[#6366F1] hover:text-[#8B5CF6] transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <AuthInput
                  id="input-password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleField}
                  icon={Lock}
                  autoComplete="current-password"
                  rightSlot={
                    <button
                      type="button"
                      onClick={() => setShowPass((v) => !v)}
                      className="text-[#475569] hover:text-[#94A3B8] transition-colors"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
              </div>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    variants={errorVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs text-red-400 overflow-hidden"
                    style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.18)' }}
                  >
                    <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                id="btn-email-signin"
                type="submit"
                disabled={loading || googleLoading}
                className="btn-primary w-full justify-center py-3 mt-1 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Sign up link */}
            <p className="text-center text-sm text-[#94A3B8] mt-6">
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold text-[#6366F1] hover:text-[#8B5CF6] transition-colors">
                Create one free
              </Link>
            </p>

            {/* Terms */}
            <p className="text-center text-[11px] text-[#475569] mt-4 leading-relaxed">
              By signing in you agree to our{' '}
              <a href="#" className="hover:text-[#6366F1] transition-colors">
                Terms
              </a>{' '}
              and{' '}
              <a href="#" className="hover:text-[#6366F1] transition-colors">
                Privacy Policy
              </a>
              .
            </p>
          </motion.div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}
      </AnimatePresence>
    </>
  )
}
