import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Brain, BarChart3, Clock, Trophy, TrendingUp, Flame,
  Play, FileText, LogOut, ChevronRight, Target,
  Plus, Calendar, Upload, Sparkles, Loader2, ArrowRight,
  Bell, Star, Rocket, Gem, GraduationCap, Award, Lock,
  CheckCircle2, Dumbbell, Zap, RefreshCw, AlertCircle, Briefcase, ShieldCheck
} from 'lucide-react'
import axios from 'axios'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'
import { db } from '../firebase'
import ProfileSetup from '../components/ProfileSetup'
import ThemeToggle from '../components/ThemeToggle'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// ─── Helpers ──────────────────────────────────────────────────────────────────
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}

function StatCard({ icon: Icon, label, value, sub, color = '#6366F1', trend, isStreak, streakCount }) {
  if (isStreak) {
    const hasStreak = streakCount > 0
    return (
      <motion.div
        variants={fadeUp}
        className="feature-card group cursor-default relative overflow-hidden"
        style={{
          backgroundColor: 'var(--card-bg)',
          border: hasStreak ? '1.5px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--card-border)',
          boxShadow: hasStreak ? '0 4px 20px rgba(239, 68, 68, 0.15)' : 'var(--card-shadow)',
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center relative"
            style={{
              background: hasStreak
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(245, 158, 11, 0.2))'
                : `${color}15`,
              border: hasStreak ? '1px solid rgba(239, 68, 68, 0.4)' : `1px solid ${color}30`,
            }}
          >
            {hasStreak ? (
              <motion.div
                animate={{
                  scale: [1, 1.25, 1],
                  rotate: [-4, 4, -4],
                }}
                transition={{
                  duration: 1.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <Flame className="w-5 h-5 text-red-500 fill-red-500/40" />
              </motion.div>
            ) : (
              <Flame className="w-5 h-5 text-text-muted" />
            )}
          </div>
          {hasStreak ? (
            <motion.span
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm"
              style={{
                background: 'linear-gradient(135deg, #EF4444, #F59E0B)',
                color: '#FFFFFF',
                boxShadow: '0 0 10px rgba(239, 68, 68, 0.4)',
              }}
            >
              🔥 Active
            </motion.span>
          ) : (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: 'var(--pill-bg)',
                color: 'var(--text-muted)',
                border: '1px solid var(--surface-border)',
              }}
            >
              Ready
            </span>
          )}
        </div>

        {hasStreak ? (
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="text-xl leading-none select-none"
              >
                🔥
              </motion.span>
              <p className="text-2xl font-black gradient-text-flame leading-none">
                {streakCount} {streakCount === 1 ? 'day' : 'days'}
              </p>
            </div>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</p>
            <p className="text-xs font-bold mt-1 text-orange-500 flex items-center gap-1">
              🔥 {streakCount} day streak
            </p>
          </div>
        ) : (
          <div>
            <p className="text-2xl font-black mb-0.5" style={{ color: 'var(--text-primary)' }}>
              0 days
            </p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</p>
            <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--text-muted)' }}>
              Start your streak today!
            </p>
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={fadeUp}
      className="feature-card group cursor-default"
      style={{
        backgroundColor: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        boxShadow: 'var(--card-shadow)',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trend >= 0 ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-2xl font-black mb-0.5" style={{ color: 'var(--text-primary)' }}>{value}</p>
      <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
    </motion.div>
  )
}

// ─── Streak Calendar (last 28 days) ───────────────────────────────────────────
function StreakCalendar({ interviewDates = [] }) {
  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (27 - i))
    return d.toDateString()
  })

  const dateSet = new Set(interviewDates.map((d) => new Date(d).toDateString()))

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-semibold text-text-primary">Activity — Last 28 days</p>
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <div className="w-3 h-3 rounded-sm" style={{ background: 'var(--surface-border)' }} />
          <span>None</span>
          <div className="w-3 h-3 rounded-sm bg-brand-indigo" />
          <span>Active</span>
        </div>
      </div>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: 'repeat(14, 1fr)' }}>
        {days.map((day, i) => {
          const active = dateSet.has(day)
          return (
            <div
              key={i}
              title={day}
              className="aspect-square rounded-sm transition-all duration-200"
              style={{
                background: active
                  ? `rgba(99,102,241,${0.4 + Math.random() * 0.6})`
                  : 'var(--pill-bg)',
                border: active ? '1px solid rgba(99,102,241,0.4)' : '1px solid var(--surface-border)',
              }}
            />
          )
        })}
      </div>
    </div>
  )
}

// ─── Score Badge ──────────────────────────────────────────────────────────────
function ScoreBadge({ score }) {
  const color = score >= 80 ? '#10B981' : score >= 60 ? '#6366F1' : score >= 40 ? '#F59E0B' : '#EF4444'
  const label = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : score >= 40 ? 'Average' : 'Needs Work'
  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
      style={{ color, background: `${color}15` }}>
      {score}% · {label}
    </span>
  )
}

// ─── Badges Logic & Achievements Component ─────────────────────────────────────
function getAchievements(history = [], currentStreak = 0) {
  const totalInterviews = history.length
  const scores = history.map((h) => {
    const s = h.totalScore ?? h.score
    return typeof s === 'number' ? s : 0
  })
  const bestScore = scores.length ? Math.max(...scores) : 0

  const hasUnder1Min = history.some((h) => {
    const t = h.timePerQuestion ?? h.timeLimit ?? h.customTimeLimit
    return typeof t === 'number' && t <= 60 && t > 0
  })

  return [
    {
      id: 'first_interview',
      name: 'First Interview',
      description: 'Complete your first interview',
      icon: Target,
      emoji: '🎯',
      earned: totalInterviews >= 1,
      color: '#6366F1',
    },
    {
      id: 'on_fire',
      name: 'On Fire',
      description: '3 day streak',
      icon: Flame,
      emoji: '🔥',
      earned: currentStreak >= 3,
      color: '#EF4444',
    },
    {
      id: 'consistent',
      name: 'Consistent',
      description: 'Complete 5 interviews',
      icon: Dumbbell,
      emoji: '💪',
      earned: totalInterviews >= 5,
      color: '#10B981',
    },
    {
      id: 'high_achiever',
      name: 'High Achiever',
      description: 'Score above 70 in any interview',
      icon: Star,
      emoji: '⭐',
      earned: bestScore > 70,
      color: '#F59E0B',
    },
    {
      id: 'speed_runner',
      name: 'Speed Runner',
      description: 'Complete an interview under 1 minute timer',
      icon: Rocket,
      emoji: '🚀',
      earned: hasUnder1Min,
      color: '#8B5CF6',
    },
    {
      id: 'champion',
      name: 'Champion',
      description: 'Score above 90',
      icon: Trophy,
      emoji: '🏆',
      earned: bestScore > 90,
      color: '#F59E0B',
    },
    {
      id: 'diamond',
      name: 'Diamond',
      description: '7 day streak',
      icon: Gem,
      emoji: '💎',
      earned: currentStreak >= 7,
      color: '#3B82F6',
    },
    {
      id: 'graduate',
      name: 'Graduate',
      description: 'Complete 10 interviews',
      icon: GraduationCap,
      emoji: '🎓',
      earned: totalInterviews >= 10,
      color: '#10B981',
    },
    {
      id: 'perfect',
      name: 'Perfect',
      description: 'Score 100/100',
      icon: Award,
      emoji: '🌟',
      earned: scores.some((s) => s === 100),
      color: '#EC4899',
    },
  ]
}

function AchievementsSection({ achievements = [] }) {
  const earnedCount = achievements.filter((a) => a.earned).length
  const totalCount = achievements.length
  const percent = Math.round((earnedCount / totalCount) * 100)

  return (
    <div className="space-y-4 pt-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Award className="w-4 h-4 text-brand-indigo" />
            Your Achievements
          </h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
            Unlock milestone badges by practicing, maintaining streaks, and acing mock interviews
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold self-start sm:self-auto"
          style={{
            backgroundColor: 'var(--pill-bg)',
            border: '1px solid var(--surface-border)',
            color: 'var(--text-primary)',
          }}
        >
          <span>🏆 {earnedCount} of {totalCount} Unlocked</span>
          <span className="text-brand-indigo font-bold">({percent}%)</span>
        </div>
      </div>

      {/* Progress track */}
      <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--pill-bg)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #6366F1, #8B5CF6, #EC4899)' }}
        />
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {achievements.map((badge) => {
          return (
            <motion.div
              key={badge.id}
              whileHover={{ y: -2 }}
              className="p-3.5 rounded-2xl transition-all duration-200 relative overflow-hidden flex flex-col justify-between"
              style={{
                backgroundColor: badge.earned ? 'var(--card-bg)' : 'var(--pill-bg)',
                border: badge.earned
                  ? `1.5px solid ${badge.color}45`
                  : '1px dashed var(--surface-border)',
                boxShadow: badge.earned ? 'var(--card-shadow)' : 'none',
                opacity: badge.earned ? 1 : 0.65,
              }}
            >
              {/* Top row: Icon + status badge */}
              <div className="flex items-start justify-between mb-2.5">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg relative"
                  style={{
                    background: badge.earned ? `${badge.color}18` : 'var(--surface-border)',
                    border: `1px solid ${badge.earned ? `${badge.color}40` : 'transparent'}`,
                  }}
                >
                  <span className={badge.earned ? '' : 'grayscale opacity-60'}>{badge.emoji}</span>
                  {!badge.earned && (
                    <div
                      className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ background: 'var(--surface-default)', border: '1px solid var(--surface-border)' }}
                    >
                      <Lock className="w-2.5 h-2.5" style={{ color: 'var(--text-muted)' }} />
                    </div>
                  )}
                </div>

                {badge.earned ? (
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1"
                    style={{
                      background: 'rgba(16, 185, 129, 0.12)',
                      color: '#10B981',
                      border: '1px solid rgba(16, 185, 129, 0.25)',
                    }}
                  >
                    <CheckCircle2 className="w-3 h-3" /> Unlocked
                  </span>
                ) : (
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
                    style={{
                      background: 'var(--pill-bg)',
                      color: 'var(--text-muted)',
                      border: '1px solid var(--surface-border)',
                    }}
                  >
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </span>
                )}
              </div>

              {/* Title & Description */}
              <div>
                <h3
                  className="text-xs font-bold mb-0.5 truncate"
                  style={{ color: badge.earned ? 'var(--text-primary)' : 'var(--text-muted)' }}
                >
                  {badge.name}
                </h3>
                <p className="text-[11px] leading-snug" style={{ color: 'var(--text-muted)' }}>
                  {badge.description}
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ─── New Interview Modal with Resume Upload Support ─────────────────────────
const DOMAINS = ['DSA', 'Web Dev', 'System Design', 'OS', 'DBMS', 'Networking', 'HR', 'Behavioral']
const TYPES = ['Technical', 'HR', 'Mixed']
const DIFFICULTIES = ['Easy', 'Medium', 'Hard']

export function NewInterviewModal({ onClose, onStart, initialRole = 'Software Engineer' }) {
  const [activeTab, setActiveTab] = useState('standard') // 'standard' | 'resume'
  const [config, setConfig] = useState({
    type: 'Technical',
    difficulty: 'Medium',
    domain: 'DSA',
    timePerQuestion: 120,
  })
  const [modalJobDescription, setModalJobDescription] = useState('')
  const [modalResumeText, setModalResumeText] = useState('')
  
  // Resume mode states
  const [resumeFile, setResumeFile] = useState(null)
  const [targetRole, setTargetRole] = useState(initialRole)
  const [resumeDifficulty, setResumeDifficulty] = useState('Medium')
  const [analyzingResume, setAnalyzingResume] = useState(false)
  const [isServerWaking, setIsServerWaking] = useState(false)
  const [resumeError, setResumeError] = useState('')

  const handleResumeFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setResumeFile(file)
      setResumeError('')
    }
  }

  const handleStartResumeInterview = async () => {
    setAnalyzingResume(true)
    setResumeError('')

    const wakeTimer = setTimeout(() => {
      setIsServerWaking(true)
    }, 3000)

    try {
      let questions = []
      if (resumeFile) {
        const formData = new FormData()
        formData.append('resume', resumeFile)
        formData.append('targetRole', targetRole)
        formData.append('difficulty', resumeDifficulty)

        const res = await axios.post(`${API_BASE}/api/interview/resume`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        questions = res.data?.questions || []
      } else {
        const res = await axios.post(`${API_BASE}/api/interview/resume`, {
          targetRole,
          difficulty: resumeDifficulty,
          resumeText: `Candidate profile targeting ${targetRole} position.`,
        })
        questions = res.data?.questions || []
      }

      onStart({
        type: 'Technical',
        difficulty: resumeDifficulty,
        domain: `Resume · ${targetRole}`,
        isResumeBased: true,
        customQuestions: questions,
        timePerQuestion: config.timePerQuestion !== undefined ? config.timePerQuestion : 120,
      })
    } catch (err) {
      console.warn('Resume API fallback:', err)
      const errMsg = err?.response?.data?.error || err?.message || 'Server did not respond'
      setResumeError(`Could not connect to interview server (${errMsg}). Render free tier instances may take up to a minute to wake up on first visit.`)
    } finally {
      clearTimeout(wakeTimer)
      setIsServerWaking(false)
      setAnalyzingResume(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'var(--modal-overlay)', backdropFilter: 'blur(12px)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="glass-card w-full max-w-md p-5 sm:p-7 relative max-h-[92vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-black text-text-primary">New Interview Session</h2>
            <p className="text-text-secondary text-xs">Choose practice mode & configure session.</p>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary text-sm p-1"
          >
            ✕
          </button>
        </div>

        {/* Tab switcher: Standard vs Resume */}
        <div className="flex rounded-xl p-1 mb-5" style={{ background: 'var(--pill-bg)', border: '1px solid var(--surface-border)' }}>
          <button
            onClick={() => setActiveTab('standard')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'standard'
                ? 'bg-brand-indigo text-white shadow-lg'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Topic & Domain
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'resume'
                ? 'bg-brand-indigo text-white shadow-lg'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Resume Upload
          </button>
        </div>

        {activeTab === 'standard' ? (
          <div className="space-y-4">
            {/* Type */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Interview Type</label>
              <div className="grid grid-cols-3 gap-2">
                {TYPES.map((t) => (
                  <button key={t} onClick={() => setConfig((c) => ({ ...c, type: t }))}
                    className="py-2.5 rounded-xl text-xs font-semibold transition-all"
                    style={{
                      border: `1px solid ${config.type === t ? '#6366F1' : 'var(--surface-border)'}`,
                      background: config.type === t ? 'rgba(99,102,241,0.12)' : 'var(--pill-bg)',
                      color: config.type === t ? '#6366F1' : 'var(--text-secondary)',
                    }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Domain */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Domain</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {DOMAINS.map((d) => (
                  <button key={d} onClick={() => setConfig((c) => ({ ...c, domain: d }))}
                    className="py-2 rounded-xl text-[11px] font-semibold transition-all"
                    style={{
                      border: `1px solid ${config.domain === d ? '#6366F1' : 'var(--surface-border)'}`,
                      background: config.domain === d ? 'rgba(99,102,241,0.12)' : 'var(--pill-bg)',
                      color: config.domain === d ? '#6366F1' : 'var(--text-secondary)',
                    }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Difficulty</label>
              <div className="grid grid-cols-3 gap-2">
                {DIFFICULTIES.map((dif) => {
                  const colors = { Easy: '#10B981', Medium: '#F59E0B', Hard: '#EF4444' }
                  const active = config.difficulty === dif
                  return (
                    <button key={dif} onClick={() => setConfig((c) => ({ ...c, difficulty: dif }))}
                      className="py-2.5 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        border: `1px solid ${active ? colors[dif] : 'var(--surface-border)'}`,
                        background: active ? `${colors[dif]}15` : 'var(--pill-bg)',
                        color: active ? colors[dif] : 'var(--text-secondary)',
                      }}>
                      {dif}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time per Question */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Time per Question</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { label: 'No Limit', value: 0 },
                  { label: '1 min', value: 60 },
                  { label: '2 min', value: 120, recommended: true },
                  { label: '3 min', value: 180 },
                ].map((opt) => {
                  const active = config.timePerQuestion === opt.value
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setConfig((c) => ({ ...c, timePerQuestion: opt.value }))}
                      className="py-2.5 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center min-h-[46px]"
                      style={{
                        border: `1px solid ${active ? '#6366F1' : 'var(--surface-border)'}`,
                        background: active ? 'rgba(99,102,241,0.12)' : 'var(--pill-bg)',
                        color: active ? '#6366F1' : 'var(--text-secondary)',
                      }}
                    >
                      <span>{opt.label}</span>
                      {opt.recommended && (
                        <span className={`text-[8px] font-bold tracking-tight ${active ? 'text-brand-indigo' : 'text-text-muted'}`}>
                          Recommended
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Paste your resume (optional) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="modal-resume-input" className="block text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-brand-indigo" />
                  Paste your resume (optional)
                </label>
                <span className={`text-[10px] font-mono ${modalResumeText.length >= 6000 ? 'text-amber-400 font-bold' : 'text-text-muted'}`}>
                  {modalResumeText.length} / 6000
                </span>
              </div>
              <textarea
                id="modal-resume-input"
                rows={3}
                maxLength={6000}
                value={modalResumeText}
                onChange={(e) => setModalResumeText(e.target.value.slice(0, 6000))}
                placeholder="Paste your projects, skills, or experience from your resume..."
                className="input-field text-xs py-2 w-full resize-none min-h-[64px]"
              />
              <p className="text-[10px] text-text-muted mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                <span>Your resume text is used only to generate questions for this session and is not saved.</span>
              </p>
            </div>

            {/* Paste a job description (optional) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="modal-jd-input" className="block text-xs font-semibold text-text-secondary flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-brand-indigo" />
                  Paste a job description (optional)
                </label>
                <span className={`text-[10px] font-mono ${modalJobDescription.length >= 4000 ? 'text-amber-400 font-bold' : 'text-text-muted'}`}>
                  {modalJobDescription.length} / 4000
                </span>
              </div>
              <p className="text-[11px] text-text-muted mb-1.5">
                We'll tailor questions to this role.
              </p>
              <textarea
                id="modal-jd-input"
                rows={3}
                maxLength={4000}
                value={modalJobDescription}
                onChange={(e) => setModalJobDescription(e.target.value.slice(0, 4000))}
                placeholder="Paste role requirements, skills, or responsibilities..."
                className="input-field text-xs py-2 w-full resize-none min-h-[64px]"
              />
            </div>

            <div className="flex gap-3 pt-3">
              <button onClick={onClose} className="btn-secondary flex-1 justify-center py-2.5 text-xs">Cancel</button>
              <button
                id="btn-start-interview"
                onClick={() => onStart({
                  ...config,
                  jobDescription: modalJobDescription.trim(),
                  resumeText: modalResumeText.trim(),
                  autoStart: true,
                })}
                className="btn-primary flex-1 justify-center py-2.5 text-xs"
              >
                <Play className="w-3.5 h-3.5" /> Start Interview
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Resume Upload Area */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Upload Resume (PDF / TXT)</label>
              <label
                className="border-2 border-dashed border-surface-border rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-brand-indigo transition-colors"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <Upload className="w-6 h-6 text-brand-indigo mb-2" />
                <span className="text-xs font-medium text-text-primary">
                  {resumeFile ? resumeFile.name : 'Click to select or drop resume PDF'}
                </span>
                <span className="text-[10px] text-text-muted mt-1">
                  Gemini extracts your projects, tools & target skills
                </span>
                <input
                  type="file"
                  accept=".pdf,.txt,.doc,.docx"
                  onChange={handleResumeFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Target Role */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Target Role</label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="e.g. Senior Frontend Engineer, Full Stack Dev"
                className="input-field text-xs py-2 w-full"
              />
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">Difficulty</label>
              <div className="grid grid-cols-3 gap-2">
                {DIFFICULTIES.map((dif) => {
                  const colors = { Easy: '#10B981', Medium: '#F59E0B', Hard: '#EF4444' }
                  const active = resumeDifficulty === dif
                  return (
                    <button key={dif} onClick={() => setResumeDifficulty(dif)}
                      className="py-2.5 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        border: `1px solid ${active ? colors[dif] : 'var(--surface-border)'}`,
                        background: active ? `${colors[dif]}15` : 'var(--pill-bg)',
                        color: active ? colors[dif] : 'var(--text-secondary)',
                      }}>
                      {dif}
                    </button>
                  )
                })}
              </div>
            </div>

            {resumeError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-left">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-red-300 font-semibold">Resume Connection Issue</p>
                    <p className="text-[11px] text-red-200/80 mt-0.5 leading-relaxed">{resumeError}</p>
                    <div className="flex items-center gap-2 mt-2.5">
                      <button
                        type="button"
                        onClick={handleStartResumeInterview}
                        disabled={analyzingResume}
                        className="px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${analyzingResume ? 'animate-spin' : ''}`} />
                        Retry Extraction
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('standard')}
                        className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-text-primary text-[11px] font-medium transition-all cursor-pointer"
                      >
                        Use Standard Topics
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-3">
              <button onClick={onClose} disabled={analyzingResume} className="btn-secondary flex-1 justify-center py-2.5 text-xs">
                Cancel
              </button>
              <button
                id="btn-start-resume-interview"
                onClick={handleStartResumeInterview}
                disabled={analyzingResume}
                className="btn-primary flex-1 justify-center py-2.5 text-xs font-bold"
              >
                {analyzingResume ? (
                  <span className="flex items-center gap-1.5 text-center">
                    <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
                    <span>
                      {isServerWaking
                        ? 'Waking up the interview server... this can take up to a minute on first visit'
                        : 'Analyzing Resume…'}
                    </span>
                  </span>
                ) : (
                  <><Sparkles className="w-3.5 h-3.5" /> Start Tailored Session</>
                )}
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const { user, profile, logout } = useAuth()

  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [showNewInterview, setShowNewInterview] = useState(false)
  const [history, setHistory] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(true)

  // Show profile setup if incomplete
  useEffect(() => {
    if (profile && !profile.profileComplete) setShowProfileSetup(true)
  }, [profile])

  // Fetch interview history from reports collection
  useEffect(() => {
    if (!user) {
      setHistory([])
      setLoadingHistory(false)
      return
    }

    const fetchHistory = async () => {
      try {
        const q = query(
          collection(db, 'reports'),
          where('userId', '==', user.uid)
        )
        const snap = await getDocs(q)
        let reports = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

        // Also check legacy interviews collection if reports is empty
        if (reports.length === 0) {
          try {
            const legacyQ = query(
              collection(db, 'interviews'),
              where('userId', '==', user.uid)
            )
            const legacySnap = await getDocs(legacyQ)
            reports = legacySnap.docs.map((d) => ({ id: d.id, ...d.data() }))
          } catch {}
        }

        // Sort descending by createdAt in memory
        reports.sort((a, b) => {
          const tA = a.createdAt?.toMillis?.() || (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0)
          const tB = b.createdAt?.toMillis?.() || (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0)
          return tB - tA
        })

        setHistory(reports)
      } catch (err) {
        console.warn('Error fetching reports from Firestore:', err)
        setHistory([])
      } finally {
        setLoadingHistory(false)
      }
    }

    fetchHistory()
  }, [user])

  const handleLogout = async () => { await logout(); navigate('/') }

  const handleStartInterview = (config) => {
    navigate('/interview', { state: config })
    setShowNewInterview(false)
  }

  // Calculate consecutive days streak from reports
  const calculateStreak = (reportsList) => {
    if (!reportsList || reportsList.length === 0) return 0
    const dates = new Set()
    reportsList.forEach((r) => {
      let d = null
      if (r.createdAt?.toDate) {
        d = r.createdAt.toDate()
      } else if (r.createdAt?.seconds) {
        d = new Date(r.createdAt.seconds * 1000)
      } else if (typeof r.createdAt === 'string') {
        d = new Date(r.createdAt)
      }
      if (d && !isNaN(d.getTime())) {
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
        dates.add(key)
      }
    })

    if (dates.size === 0) return 0

    const now = new Date()
    const formatKey = (date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

    const todayKey = formatKey(now)
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayKey = formatKey(yesterday)

    let cursor = null
    if (dates.has(todayKey)) {
      cursor = new Date(now)
    } else if (dates.has(yesterdayKey)) {
      cursor = new Date(yesterday)
    } else {
      return 0
    }

    let streak = 0
    while (cursor && dates.has(formatKey(cursor))) {
      streak += 1
      cursor.setDate(cursor.getDate() - 1)
    }
    return streak
  }

  // Real stats computed from Firestore reports
  const scoresList = history
    .map((h) => h.totalScore ?? h.score)
    .filter((s) => typeof s === 'number')
  const avgScore = scoresList.length ? Math.round(scoresList.reduce((a, b) => a + b, 0) / scoresList.length) : null
  const bestScore = scoresList.length ? Math.max(...scoresList) : null
  const totalSessionsCount = history.length
  const currentStreak = calculateStreak(history) || profile?.streak || 0

  const achievements = useMemo(() => {
    return getAchievements(history, currentStreak)
  }, [history, currentStreak])

  const stats = [
    { icon: BarChart3, label: 'Avg Score', value: avgScore !== null ? `${avgScore}%` : '—', color: '#6366F1' },
    { icon: Trophy, label: 'Best Score', value: bestScore !== null ? `${bestScore}%` : '—', color: '#F59E0B' },
    {
      icon: Flame,
      label: 'Day Streak',
      value: currentStreak > 0 ? `${currentStreak} ${currentStreak === 1 ? 'day' : 'days'}` : '0 days',
      sub: currentStreak > 0 ? `🔥 ${currentStreak} day streak` : 'Start your streak today!',
      color: '#EF4444',
      isStreak: true,
      streakCount: currentStreak,
    },
    { icon: Clock, label: 'Total Interviews', value: totalSessionsCount, sub: 'Sessions completed', color: '#10B981' },
  ]

  const displayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'there'
  const initials = displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
      {/* Profile Setup Modal */}
      {showProfileSetup && (
        <ProfileSetup onComplete={() => setShowProfileSetup(false)} />
      )}

      {/* New Interview Modal */}
      {showNewInterview && (
        <NewInterviewModal
          onClose={() => setShowNewInterview(false)}
          onStart={handleStartInterview}
        />
      )}

      {/* Sidebar */}
      <aside
        className="app-sidebar fixed top-0 left-0 h-full w-60 flex flex-col z-40 hidden lg:flex"
        style={{
          backgroundColor: 'var(--sidebar-bg)',
          borderRight: '1px solid var(--sidebar-border)',
        }}
      >
        {/* Logo */}
        <div
          className="app-sidebar-logo flex items-center gap-3 px-5 h-16 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--sidebar-border)' }}
        >
          <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold" style={{ color: 'var(--sidebar-text)' }}>
            InterviewSense
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {[
            { icon: BarChart3, label: 'Dashboard', active: true, action: () => navigate('/dashboard') },
            { icon: Play, label: 'New Interview', action: () => setShowNewInterview(true) },
            { icon: FileText, label: 'My Reports', action: () => navigate('/dashboard') },
            { icon: TrendingUp, label: 'Progress', action: () => navigate('/progress') },
            { icon: Target, label: 'Practice', action: () => setShowNewInterview(true) },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className={`app-sidebar-nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                item.active ? 'active' : ''
              }`}
              style={
                item.active
                  ? {
                      backgroundColor: 'var(--sidebar-active-bg)',
                      color: 'var(--sidebar-active-text)',
                      borderColor: 'var(--sidebar-active-border)',
                    }
                  : {
                      color: 'var(--sidebar-text)',
                    }
              }
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User profile at bottom */}
        <div
          className="app-sidebar-user p-3 flex-shrink-0"
          style={{
            borderTop: '1px solid var(--sidebar-border)',
            backgroundColor: 'var(--sidebar-bg)',
          }}
        >
          <div className="app-sidebar-user-card flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-brand-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: 'var(--sidebar-text)' }}>
                {displayName}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--sidebar-text-muted)' }}>
                {profile?.targetRole || 'Set your role'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-500"
              style={{ color: 'var(--sidebar-text-muted)' }}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main
        className="lg:ml-60 min-h-screen transition-colors duration-300"
        style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
      >
        {/* Top bar */}
        <header
          className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 sm:px-6 border-b transition-colors duration-300"
          style={{
            background: 'var(--nav-bg)',
            borderColor: 'var(--surface-border)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <div>
            <h1 className="text-base font-bold text-text-primary">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
              <span className="gradient-text-brand">{displayName.split(' ')[0]} 👋</span>
            </h1>
            <p className="text-xs text-text-muted">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle id="theme-toggle-dashboard" />
            <button
              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors border"
              style={{
                backgroundColor: 'var(--card-bg)',
                borderColor: 'var(--surface-border)',
                color: 'var(--text-secondary)',
              }}
            >
              <Bell className="w-4 h-4" />
            </button>
            <button
              id="btn-new-interview-header"
              onClick={() => setShowNewInterview(true)}
              className="btn-primary py-2 px-3 sm:px-4 text-xs sm:text-sm"
            >
              <Plus className="w-4 h-4" /> <span className="hidden sm:inline">New Interview</span>
            </button>
          </div>
        </header>

        <div className="p-4 sm:p-6 max-w-6xl mx-auto">
          {/* Streak banner */}
          {(currentStreak > 0 || (profile?.streak ?? 0) > 0) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 p-4 rounded-2xl mb-6"
              style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(245,158,11,0.1))', border: '1px solid rgba(245,158,11,0.2)' }}>
              <div className="text-3xl">🔥</div>
              <div>
                <p className="text-text-primary font-bold text-sm">{currentStreak || profile.streak}-day streak! Keep it going!</p>
                <p className="text-text-muted text-xs">Practice today to maintain your streak.</p>
              </div>
              <button onClick={() => setShowNewInterview(true)} className="btn-primary ml-auto py-2 px-4 text-sm">
                Practice Now <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}

          {/* Stat cards */}
          <motion.div initial="hidden" animate="visible" variants={stagger}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((s) => <StatCard key={s.label} {...s} />)}
          </motion.div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Interview history */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-text-primary">Recent Interviews</h2>
                <button className="text-xs text-brand-indigo hover:underline flex items-center gap-1">
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                {loadingHistory ? (
                  <div className="flex items-center justify-center py-12 glass-card">
                    <div className="w-8 h-8 border-2 border-brand-indigo border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : history.length === 0 ? (
                  // Empty state
                  <div className="glass-card flex flex-col items-center justify-center py-14 px-6 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
                      <Play className="w-7 h-7 text-white" />
                    </div>
                    <p className="text-text-primary font-bold text-lg mb-1">Start your first interview</p>
                    <p className="text-text-secondary text-sm mb-6 max-w-sm">
                      Practice real technical, HR, and resume-based questions with real-time AI speech transcription and detailed reports.
                    </p>
                    <button
                      id="btn-start-first"
                      onClick={() => setShowNewInterview(true)}
                      className="btn-primary py-3 px-6 text-sm font-bold shadow-lg shadow-indigo-500/25"
                    >
                      Start Your First Interview <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {history.map((item, index) => {
                      const rawScore = item.totalScore ?? item.score ?? 70
                      const score = typeof rawScore === 'number' ? rawScore : 70

                      // Check if this is the most recent attempt and score improved compared to previous attempt
                      const isMostRecent = index === 0
                      let isImprovement = false
                      let improvementDelta = 0

                      if (isMostRecent && history.length > 1) {
                        const earlierAttempt = history.slice(1).find(
                          (h) => (h.domain || 'Technical').toLowerCase().trim() === (item.domain || 'Technical').toLowerCase().trim()
                        ) || history[1]

                        if (earlierAttempt) {
                          const prevScore = earlierAttempt.totalScore ?? earlierAttempt.score
                          if (typeof score === 'number' && typeof prevScore === 'number' && score > prevScore) {
                            isImprovement = true
                            improvementDelta = score - prevScore
                          }
                        }
                      }

                      // Overall score color: green >70, yellow 50-70, red <50
                      const isGreen = score > 70
                      const isYellow = score >= 50 && score <= 70
                      const scoreColor = isGreen ? '#10B981' : isYellow ? '#F59E0B' : '#EF4444'
                      const scoreBg = isGreen ? 'rgba(16, 185, 129, 0.1)' : isYellow ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)'
                      const scoreBorder = isGreen ? 'rgba(16, 185, 129, 0.3)' : isYellow ? 'rgba(245, 158, 11, 0.3)' : 'rgba(239, 68, 68, 0.3)'

                      const verdictLabel = item.verdict || (isGreen ? 'Strong' : isYellow ? 'Average' : 'Needs Work')

                      // Format interview date
                      let dateStr = 'Recent'
                      if (item.createdAt?.toDate) {
                        dateStr = item.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      } else if (item.createdAt?.seconds) {
                        dateStr = new Date(item.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      } else if (typeof item.createdAt === 'string') {
                        dateStr = item.createdAt
                      }

                      const diff = item.difficulty || 'Medium'
                      const diffColor = diff === 'Hard' ? '#EF4444' : diff === 'Easy' ? '#10B981' : '#F59E0B'

                      return (
                        <div
                          key={item.id}
                          className="p-4 sm:p-5 rounded-2xl transition-all duration-200 hover:border-brand-indigo/40"
                          style={{
                            background: 'var(--card-bg)',
                            border: '1px solid var(--card-border)',
                            boxShadow: 'var(--card-shadow)',
                          }}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-start sm:items-center gap-3.5">
                              {/* Score box */}
                              <div
                                className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0"
                                style={{
                                  background: scoreBg,
                                  border: `1.5px solid ${scoreBorder}`,
                                  color: scoreColor,
                                }}
                              >
                                <span className="text-lg font-black leading-none">{score}</span>
                                <span className="text-[10px] uppercase font-bold opacity-80 mt-0.5">/100</span>
                              </div>

                              {/* Details */}
                              <div>
                                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                  {/* Job Title badge if exists */}
                                  {item.jobTitle && (
                                    <span
                                      className="text-xs font-semibold px-2.5 py-0.5 rounded-lg flex items-center gap-1.5 text-indigo-300 max-w-[160px] sm:max-w-[220px]"
                                      style={{
                                        background: 'rgba(99, 102, 241, 0.12)',
                                        border: '1px solid rgba(99, 102, 241, 0.3)',
                                      }}
                                      title={item.jobTitle}
                                    >
                                      <Briefcase className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                                      <span className="truncate">{item.jobTitle}</span>
                                    </span>
                                  )}

                                  {/* Domain badge */}
                                  <span
                                    className="text-xs font-bold px-2.5 py-0.5 rounded-lg text-[#818CF8]"
                                    style={{
                                      background: 'rgba(99, 102, 241, 0.15)',
                                      border: '1px solid rgba(99, 102, 241, 0.3)',
                                    }}
                                  >
                                    {item.domain || 'Technical'}
                                  </span>

                                  {/* Difficulty badge */}
                                  <span
                                    className="text-xs font-semibold px-2 py-0.5 rounded-lg"
                                    style={{
                                      color: diffColor,
                                      background: `${diffColor}15`,
                                      border: `1px solid ${diffColor}30`,
                                    }}
                                  >
                                    {diff}
                                  </span>

                                  {/* Verdict label */}
                                  <span
                                    className="text-xs font-bold px-2.5 py-0.5 rounded-lg uppercase tracking-wider"
                                    style={{
                                      color: scoreColor,
                                      background: scoreBg,
                                      border: `1px solid ${scoreBorder}`,
                                    }}
                                  >
                                    {verdictLabel}
                                  </span>

                                  {/* Improvement badge for most recent attempt if score went up */}
                                  {isImprovement && (
                                    <span
                                      className="text-xs font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1 text-emerald-400"
                                      style={{
                                        background: 'rgba(16, 185, 129, 0.12)',
                                        border: '1px solid rgba(16, 185, 129, 0.3)',
                                      }}
                                      title={`Score increased by ${improvementDelta} points compared to previous attempt`}
                                    >
                                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                      <span>Improvement (+{improvementDelta})</span>
                                    </span>
                                  )}
                                </div>

                                {/* Subtitle with date and question count */}
                                <div className="flex items-center gap-3 text-xs text-text-muted">
                                  <span className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                                    {dateStr}
                                  </span>
                                  <span>•</span>
                                  <span>{item.type || 'Interview'}</span>
                                  <span>•</span>
                                  <span>{item.questions?.length || item.totalQuestions || 5} questions</span>
                                </div>
                              </div>
                            </div>

                            {/* View Report Button */}
                            <div className="flex items-center justify-end sm:justify-center">
                              <Link
                                to={`/report/${item.id}`}
                                className="btn-primary text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 font-bold shadow-md hover:shadow-indigo-500/20"
                              >
                                <span>View Report</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Your Achievements Section */}
              <AchievementsSection achievements={achievements} />
            </div>

            {/* Right panel */}
            <div className="space-y-5">
              {/* Profile card */}
              <div className="glass-card p-5">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-brand-gradient flex items-center justify-center text-white font-bold text-lg">
                    {initials}
                  </div>
                  <div>
                    <p className="text-text-primary font-bold text-sm">{displayName}</p>
                    <p className="text-text-muted text-xs">{profile?.targetRole || '—'}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-text-muted mb-1">
                  <span>Profile complete</span>
                  <span className="text-brand-indigo font-semibold">{profile?.profileComplete ? '100%' : '60%'}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--pill-bg)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: profile?.profileComplete ? '100%' : '60%' }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                    className="h-full rounded-full bg-brand-gradient"
                  />
                </div>
                {!profile?.profileComplete && (
                  <button onClick={() => setShowProfileSetup(true)}
                    className="mt-3 text-xs text-brand-indigo hover:underline flex items-center gap-1">
                    Complete profile <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Activity calendar */}
              <div className="glass-card p-5">
                <StreakCalendar interviewDates={history.map((h) => h.createdAt?.toDate?.())} />
              </div>

              {/* Quick start cards */}
              <div>
                <p
                  className="text-xs font-semibold mb-3 uppercase tracking-widest"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Quick Practice
                </p>
                <div className="space-y-2">
                  {[
                    { label: 'DSA · Medium', domain: 'DSA', difficulty: 'Medium', type: 'Technical', icon: '🧮' },
                    { label: 'System Design · Hard', domain: 'System Design', difficulty: 'Hard', type: 'Technical', icon: '🏗️' },
                    { label: 'HR Behavioral', domain: 'HR', difficulty: 'Medium', type: 'HR', icon: '🤝' },
                  ].map((q) => (
                    <button
                      key={q.label}
                      onClick={() => { navigate('/interview', { state: q }) }}
                      className="quick-practice-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 group"
                      style={{
                        backgroundColor: 'var(--card-bg)',
                        border: '1px solid var(--card-border)',
                        boxShadow: 'var(--card-shadow)',
                      }}
                    >
                      <span className="text-base group-hover:scale-110 transition-transform">{q.icon}</span>
                      <span
                        className="text-sm font-medium flex-1 transition-colors group-hover:text-brand-indigo"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {q.label}
                      </span>
                      <Play className="w-3.5 h-3.5 text-brand-indigo flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
