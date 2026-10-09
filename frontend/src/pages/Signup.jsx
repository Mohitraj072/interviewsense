import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle, Check } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
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
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/popup-closed-by-user': 'Google sign-in was cancelled.',
    'auth/popup-blocked': 'Popup blocked. Please allow popups for this site.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.',
  }
  return map[code] || 'Something went wrong. Please try again.'
}

// ── Password strength calculator ───────────────────────────────────────────────
function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  const map = [
    { label: '', color: '' },
    { label: 'Weak', color: '#EF4444' },
    { label: 'Fair', color: '#F59E0B' },
    { label: 'Good', color: '#3B82F6' },
    { label: 'Strong', color: '#22C55E' },
  ]
  return { score, ...map[score] }
}

// ── Password requirements list ─────────────────────────────────────────────────
function PasswordRequirements({ password }) {
  const reqs = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
    { label: 'One special character', met: /[^A-Za-z0-9]/.test(password) },
  ]
  return (
    <div className="grid grid-cols-2 gap-1.5 mt-2">
      {reqs.map(({ label, met }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div
            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
              met ? 'bg-green-500/20' : 'bg-white/5'
            }`}
          >
            {met && <Check className="w-2 h-2 text-green-400" />}
          </div>
          <span
            className={`text-[10px] transition-colors duration-300 ${
              met ? 'text-green-400' : 'text-[#475569]'
            }`}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  )
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

// ── Main Signup Page ───────────────────────────────────────────────────────────
export default function Signup() {
  const navigate = useNavigate()
  const { loginWithGoogle, registerWithEmail } = useAuth()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showReqs, setShowReqs] = useState(false)

  const strength = useMemo(() => getPasswordStrength(form.password), [form.password])

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

    if (!form.name.trim()) return setError('Please enter your full name.')
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')
    if (form.password !== form.confirm) return setError('Passwords do not match.')

    setLoading(true)
    try {
      await registerWithEmail(form.email, form.password, form.name.trim())
      navigate('/dashboard')
    } catch (err) {
      setError(friendlyError(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-bg-primary text-text-primary transition-colors duration-200">
      <div className="absolute top-5 right-5 z-30">
        <ThemeToggle id="theme-toggle-signup" />
      </div>
      {/* Left decorative panel */}
      <div className="hidden lg:flex lg:w-[44%] xl:w-[48%] flex-col items-center justify-center relative p-12 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(circle, #8B5CF6, transparent)' }}
          />
          <div
            className="absolute bottom-1/3 right-1/3 w-60 h-60 rounded-full opacity-15 blur-3xl"
            style={{ background: 'radial-gradient(circle, #6366F1, transparent)' }}
          />
        </div>
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
            Land your dream<br />role with AI
          </h2>
          <p className="text-text-secondary text-sm leading-relaxed mb-8">
            Join thousands of candidates who improved their interview performance with personalized AI coaching.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: '10k+', label: 'Users' },
              { value: '50k+', label: 'Interviews' },
              { value: '94%', label: 'Success rate' },
            ].map(({ value, label }) => (
              <div
                key={label}
                className="rounded-xl py-3 px-2 text-center bg-surface border border-surface-border"
              >
                <div
                  className="text-lg font-black"
                  style={{
                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {value}
                </div>
                <div className="text-[10px] text-text-muted mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Auth form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 overflow-y-auto">
        <motion.div
          variants={pageVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-[400px] py-8"
        >
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
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-2xl font-black text-[#F8F8FF] mb-1.5">Get started free 🚀</h1>
            <p className="text-sm text-[#94A3B8]">Create your account and start practicing today.</p>
          </div>

          {/* Google Button */}
          <button
            id="btn-google-signup"
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl mb-5 text-sm font-semibold transition-all duration-200 disabled:opacity-50 cursor-pointer border border-surface-border bg-surface hover:bg-surface-hover text-text-primary"
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-brand-indigo border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name */}
            <div>
              <label htmlFor="input-name" className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                Full name
              </label>
              <AuthInput
                id="input-name"
                name="name"
                type="text"
                placeholder="Rahul Sharma"
                value={form.name}
                onChange={handleField}
                icon={User}
                autoComplete="name"
              />
            </div>

            {/* Email */}
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

            {/* Password */}
            <div>
              <label htmlFor="input-password" className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                Password
              </label>
              <AuthInput
                id="input-password"
                name="password"
                type={showPass ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={form.password}
                onChange={(e) => {
                  handleField(e)
                  setShowReqs(true)
                }}
                icon={Lock}
                autoComplete="new-password"
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

              {/* Strength bar */}
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="flex-1 h-1 rounded-full transition-all duration-300"
                        style={{
                          background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.07)',
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] font-semibold transition-colors duration-300"
                      style={{ color: strength.color || '#475569' }}
                    >
                      {strength.label || 'Enter password'}
                    </span>
                  </div>
                </div>
              )}

              {/* Requirements */}
              <AnimatePresence>
                {showReqs && form.password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <PasswordRequirements password={form.password} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="input-confirm" className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                Confirm password
              </label>
              <AuthInput
                id="input-confirm"
                name="confirm"
                type={showConf ? 'text' : 'password'}
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={handleField}
                icon={Lock}
                autoComplete="new-password"
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowConf((v) => !v)}
                    className="text-[#475569] hover:text-[#94A3B8] transition-colors"
                  >
                    {showConf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
              {/* Match indicator */}
              {form.confirm && (
                <p
                  className={`text-[10px] mt-1.5 flex items-center gap-1 transition-colors duration-200 ${
                    form.password === form.confirm ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {form.password === form.confirm ? (
                    <>
                      <Check className="w-3 h-3" /> Passwords match
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3" /> Passwords do not match
                    </>
                  )}
                </p>
              )}
            </div>

            {/* Error */}
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
              id="btn-create-account"
              type="submit"
              disabled={loading || googleLoading}
              className="btn-primary w-full justify-center py-3 mt-1 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Sign in link */}
          <p className="text-center text-sm text-[#94A3B8] mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#6366F1] hover:text-[#8B5CF6] transition-colors">
              Sign in
            </Link>
          </p>

          {/* Terms */}
          <p className="text-center text-[11px] text-[#475569] mt-4 leading-relaxed">
            By creating an account you agree to our{' '}
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
  )
}
