import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, ArrowRight, CheckCircle, Briefcase, Code, Layers } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const ROLES = [
  'Software Engineer', 'Frontend Engineer', 'Backend Engineer',
  'Full Stack Engineer', 'Data Engineer', 'ML Engineer',
  'DevOps Engineer', 'Product Manager', 'Data Scientist',
]

const LEVELS = [
  { value: 'Fresher', label: 'Fresher', desc: '0–1 year', icon: '🌱' },
  { value: 'Junior', label: 'Junior', desc: '1–3 years', icon: '🚀' },
  { value: 'Mid', label: 'Mid-Level', desc: '3–6 years', icon: '⚡' },
  { value: 'Senior', label: 'Senior', desc: '6+ years', icon: '🏆' },
]

const STEP_LABELS = ['Your Role', 'Experience', 'Done!']

const slideVariants = {
  enter: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
}

export default function ProfileSetup({ onComplete }) {
  const { updateUserProfile } = useAuth()
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ targetRole: '', experienceLevel: '' })

  const goTo = (n) => { setDir(n > step ? 1 : -1); setStep(n) }

  const handleFinish = async () => {
    setSaving(true)
    await updateUserProfile(form)
    setSaving(false)
    onComplete?.()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(12px)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card w-full max-w-lg p-5 sm:p-8"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-text-primary font-bold text-sm">Quick Setup</p>
            <p className="text-text-muted text-xs">Takes 30 seconds</p>
          </div>
        </div>

        {/* Progress steps */}
        <div className="flex items-center gap-2 mb-8">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center gap-1.5 ${i <= step ? 'text-brand-indigo' : 'text-text-muted'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                  i < step
                    ? 'bg-brand-gradient text-white'
                    : i === step
                    ? 'border-2 border-brand-indigo text-brand-indigo'
                    : 'border border-surface-border2 text-text-muted'
                }`}>
                  {i < step ? <CheckCircle className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className="text-xs font-medium hidden sm:block">{label}</span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className="flex-1 h-px mx-1 transition-all duration-300"
                  style={{ background: i < step ? '#6366F1' : 'rgba(255,255,255,0.08)' }} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="overflow-hidden">
          <AnimatePresence mode="wait" custom={dir}>
            {step === 0 && (
              <motion.div key="step0" custom={dir} variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
                <h2 className="text-xl font-black text-text-primary mb-1">What's your target role?</h2>
                <p className="text-text-secondary text-sm mb-6">We'll tailor questions to your specific domain.</p>
                <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto pr-1">
                  {ROLES.map((role) => (
                    <button key={role}
                      onClick={() => setForm((f) => ({ ...f, targetRole: role }))}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-all duration-200 ${
                        form.targetRole === role
                          ? 'text-white border-brand-indigo'
                          : 'text-text-secondary border-surface-border hover:border-surface-border2 hover:text-text-primary'
                      }`}
                      style={{
                        border: `1px solid ${form.targetRole === role ? '#6366F1' : 'rgba(255,255,255,0.08)'}`,
                        background: form.targetRole === role ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
                      }}>
                      <Briefcase className="w-4 h-4 flex-shrink-0" style={{ color: form.targetRole === role ? '#6366F1' : undefined }} />
                      {role}
                      {form.targetRole === role && <CheckCircle className="w-4 h-4 ml-auto text-brand-indigo" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1" custom={dir} variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
                <h2 className="text-xl font-black text-text-primary mb-1">Experience level?</h2>
                <p className="text-text-secondary text-sm mb-6">This sets the difficulty baseline for your sessions.</p>
                <div className="grid grid-cols-2 gap-3">
                  {LEVELS.map((lvl) => (
                    <button key={lvl.value}
                      onClick={() => setForm((f) => ({ ...f, experienceLevel: lvl.value }))}
                      className="flex flex-col items-start p-4 rounded-xl text-left transition-all duration-200"
                      style={{
                        border: `1px solid ${form.experienceLevel === lvl.value ? '#6366F1' : 'rgba(255,255,255,0.08)'}`,
                        background: form.experienceLevel === lvl.value ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.03)',
                      }}>
                      <span className="text-2xl mb-2">{lvl.icon}</span>
                      <span className={`text-sm font-bold ${form.experienceLevel === lvl.value ? 'text-brand-indigo' : 'text-text-primary'}`}>
                        {lvl.label}
                      </span>
                      <span className="text-xs text-text-muted">{lvl.desc}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" custom={dir} variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center mx-auto mb-5">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-xl font-black text-text-primary mb-2">You're all set! 🎉</h2>
                  <p className="text-text-secondary text-sm mb-2">
                    Preparing your personalized interview experience for
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-2"
                    style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                    <Briefcase className="w-4 h-4 text-brand-indigo" />
                    <span className="text-brand-indigo font-semibold text-sm">{form.targetRole}</span>
                    <span className="text-text-muted text-xs">· {form.experienceLevel}</span>
                  </div>
                  <p className="text-text-muted text-xs mt-3">You can update these anytime from your profile settings.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-surface-border">
          <button onClick={() => goTo(step - 1)} disabled={step === 0}
            className="text-text-muted text-sm hover:text-text-primary transition-colors disabled:opacity-0 disabled:cursor-default">
            ← Back
          </button>

          {step < 2 ? (
            <button
              onClick={() => {
                if (step === 0 && !form.targetRole) return
                if (step === 1 && !form.experienceLevel) return
                goTo(step + 1)
              }}
              disabled={(step === 0 && !form.targetRole) || (step === 1 && !form.experienceLevel)}
              className="btn-primary py-2.5 px-6 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="btn-profile-complete"
              onClick={handleFinish}
              disabled={saving}
              className="btn-primary py-2.5 px-6 disabled:opacity-60"
            >
              {saving
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <><CheckCircle className="w-4 h-4" /> Go to Dashboard</>}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
