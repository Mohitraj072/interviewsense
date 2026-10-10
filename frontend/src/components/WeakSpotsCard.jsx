import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import {
  Target,
  AlertTriangle,
  Play,
  ArrowRight,
  RotateCcw,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react'

const DOMAIN_OPTIONS = ['DSA', 'Web Dev', 'System Design', 'DBMS', 'OS', 'OOPs', 'HR']
const DIFFICULTY_OPTIONS = ['Easy', 'Medium', 'Hard']

const CATEGORY_DEFINITIONS = [
  { key: 'technical_accuracy', label: 'Technical Accuracy' },
  { key: 'communication', label: 'Communication' },
  { key: 'problem_solving', label: 'Problem Solving' },
  { key: 'depth_of_knowledge', label: 'Depth of Knowledge' },
  { key: 'confidence', label: 'Confidence' },
]

export default function WeakSpotsCard({ onStartNewInterview, className = '' }) {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [reports, setReports] = useState([])
  const [selectedDomain, setSelectedDomain] = useState('DSA')
  const [selectedDifficulty, setSelectedDifficulty] = useState('Medium')

  const fetchReports = async () => {
    if (!user) {
      setReports([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Query reports for current user only
      const q = query(collection(db, 'reports'), where('userId', '==', user.uid))
      const snap = await getDocs(q)
      let list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

      // Fallback to legacy interviews collection if reports is empty
      if (list.length === 0) {
        try {
          const legacyQ = query(collection(db, 'interviews'), where('userId', '==', user.uid))
          const legacySnap = await getDocs(legacyQ)
          list = legacySnap.docs.map((d) => ({ id: d.id, ...d.data() }))
        } catch {}
      }

      // Sort descending by createdAt in memory
      list.sort((a, b) => {
        const tA = a.createdAt?.toMillis?.() || (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0)
        const tB = b.createdAt?.toMillis?.() || (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0)
        return tB - tA
      })

      setReports(list)
    } catch (err) {
      console.error('Error fetching reports for weak spots:', err)
      setError('Unable to load your past interview reports. Please check your connection and retry.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [user])

  // Compute weak spots analysis from the last 10 reports
  const analysis = useMemo(() => {
    // Look strictly at the last 10 reports (most recent 10)
    const last10 = reports.slice(0, 10)

    // Filter for reports with answered questions (ignore completely skipped sessions)
    const answeredReports = last10.filter((r) => {
      const qList = r.questions || r.per_question || []
      return qList.some((q) => !q.skipped && typeof q.score === 'number')
    })

    const isUnlocked = answeredReports.length >= 2

    if (!isUnlocked) {
      return {
        isUnlocked: false,
        answeredCount: answeredReports.length,
        weakCategories: [],
        lowestQuestions: [],
        mostRecentDomain: 'DSA',
        mostRecentDifficulty: 'Medium',
      }
    }

    // 1. Compute category averages across reports (ignoring skipped questions)
    const categoryScores = CATEGORY_DEFINITIONS.map((cat) => {
      let sum = 0
      let count = 0
      answeredReports.forEach((r) => {
        const radar = r.radarScores || r.skill_radar || {}
        const val = radar[cat.key]
        if (typeof val === 'number') {
          sum += val
          count += 1
        }
      })
      const avg = count > 0 ? Math.round(sum / count) : 70
      return {
        key: cat.key,
        label: cat.label,
        avg,
      }
    })

    // Sort ascending (lowest scores first) and take bottom 2
    categoryScores.sort((a, b) => a.avg - b.avg)
    const weakCategories = categoryScores.slice(0, 2)

    // 2. Compute up to 5 lowest-scoring answered questions (question text and score only)
    const allAnsweredQuestions = []
    answeredReports.forEach((r) => {
      const qList = r.questions || r.per_question || []
      qList.forEach((q) => {
        if (!q.skipped && typeof q.score === 'number' && q.question) {
          allAnsweredQuestions.push({
            question: String(q.question).trim(),
            score: q.score,
          })
        }
      })
    })

    // Sort ascending by score
    allAnsweredQuestions.sort((a, b) => a.score - b.score)

    // Deduplicate by question text
    const seen = new Set()
    const lowestQuestions = []
    for (const item of allAnsweredQuestions) {
      const key = item.question.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        lowestQuestions.push(item)
      }
      if (lowestQuestions.length >= 5) break
    }

    // Default to most recent domain and difficulty
    const mostRecentDomain = answeredReports[0]?.domain || 'DSA'
    const mostRecentDifficulty = answeredReports[0]?.difficulty || 'Medium'

    return {
      isUnlocked: true,
      answeredCount: answeredReports.length,
      weakCategories,
      lowestQuestions,
      mostRecentDomain,
      mostRecentDifficulty,
    }
  }, [reports])

  // Sync default domain & difficulty when analysis updates
  useEffect(() => {
    if (analysis.isUnlocked) {
      setSelectedDomain(analysis.mostRecentDomain)
      setSelectedDifficulty(analysis.mostRecentDifficulty)
    }
  }, [analysis.isUnlocked, analysis.mostRecentDomain, analysis.mostRecentDifficulty])

  const handleStartFocusedPractice = () => {
    navigate('/interview', {
      state: {
        autoStart: true,
        type: 'Weak-spot practice',
        domain: selectedDomain,
        difficulty: selectedDifficulty,
        weakSpots: {
          categories: analysis.weakCategories.map((c) => c.label),
          sampleQuestions: analysis.lowestQuestions.map((q) => q.question.slice(0, 300)),
        },
      },
    })
  }

  // 1. Loading State
  if (loading) {
    return (
      <div
        className={`glass-card p-5 sm:p-6 rounded-2xl animate-pulse ${className}`}
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-indigo/20" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-brand-indigo/15 rounded w-1/3" />
            <div className="h-3 bg-brand-indigo/10 rounded w-1/2" />
          </div>
        </div>
        <div className="h-16 bg-surface-border/30 rounded-xl mb-4" />
        <div className="h-10 bg-brand-indigo/20 rounded-xl w-full sm:w-48 ml-auto" />
      </div>
    )
  }

  // 2. Error State
  if (error) {
    return (
      <div
        className={`glass-card p-5 sm:p-6 rounded-2xl ${className}`}
        style={{
          background: 'rgba(239, 68, 68, 0.04)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-text-primary">Weak-Spot Analysis Unavailable</h3>
              <p className="text-xs text-text-secondary mt-0.5">{error}</p>
            </div>
          </div>
          <button
            onClick={fetchReports}
            className="btn-secondary py-2 px-3 text-xs flex items-center gap-1.5 self-end sm:self-auto cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      </div>
    )
  }

  // 3. Locked State: Fewer than 2 answered reports
  if (!analysis.isUnlocked) {
    return (
      <div
        className={`glass-card p-5 sm:p-6 rounded-2xl relative overflow-hidden transition-all duration-300 ${className}`}
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.02) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
        }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
              <Lock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                  Practice Mode
                </span>
                <span className="text-xs text-text-muted">
                  {analysis.answeredCount}/2 interviews completed
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-text-primary mt-1">
                Complete 2 interviews to unlock weak-spot practice
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary mt-1 leading-relaxed max-w-xl">
                Once you finish 2 interviews with answered questions, our AI will automatically identify your two
                lowest-scoring categories and questions from your last 10 attempts to generate focused practice drills.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (onStartNewInterview) {
                onStartNewInterview()
              } else {
                navigate('/interview')
              }
            }}
            className="btn-primary py-2.5 px-4 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 w-full sm:w-auto flex-shrink-0 shadow-md shadow-indigo-500/20 cursor-pointer"
          >
            <Play className="w-4 h-4" />
            <span>Start an Interview</span>
          </button>
        </div>
      </div>
    )
  }

  // 4. Unlocked State: 2+ answered reports
  const [cat1, cat2] = analysis.weakCategories
  const category1Name = cat1?.label || 'Core Fundamentals'
  const category2Name = cat2?.label || 'Technical Accuracy'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-5 sm:p-6 rounded-2xl relative overflow-hidden transition-all duration-300 ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.06) 0%, rgba(99, 102, 241, 0.05) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.25)',
      }}
    >
      <div className="flex flex-col gap-5">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25">
                  AI Weak-Spot Practice
                </span>
                <span className="text-[11px] text-text-muted">
                  Analyzed from your last {Math.min(10, reports.length)} reports
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-text-primary mt-0.5">
                Your weak spots: <span className="text-amber-400">{category1Name}</span> &{' '}
                <span className="text-brand-indigo">{category2Name}</span>
              </h3>
            </div>
          </div>

          {/* Quick Score Chips */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {cat1 && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center gap-1.5">
                <span>{cat1.label}:</span>
                <strong className="font-bold">{cat1.avg}%</strong>
              </span>
            )}
            {cat2 && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center gap-1.5">
                <span>{cat2.label}:</span>
                <strong className="font-bold">{cat2.avg}%</strong>
              </span>
            )}
          </div>
        </div>

        {/* Lowest-scoring questions / topics preview */}
        {analysis.lowestQuestions.length > 0 && (
          <div className="space-y-2 pt-1">
            <p className="text-xs font-semibold text-text-secondary flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Questions & topics targeted for this session:</span>
            </p>
            <div className="grid grid-cols-1 gap-2">
              {analysis.lowestQuestions.map((qItem, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs transition-colors"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--surface-border)',
                  }}
                >
                  <p className="text-text-primary truncate font-medium flex-1">
                    <span className="text-text-muted font-bold mr-1.5">#{idx + 1}</span>
                    {qItem.question}
                  </p>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full text-[11px] flex-shrink-0 ${
                      qItem.score < 50
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}
                  >
                    Score: {qItem.score}/100
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Configuration Row & Start Button */}
        <div
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-3 border-t"
          style={{ borderColor: 'var(--surface-border)' }}
        >
          {/* Domain & Difficulty Pickers */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label htmlFor="weak-spot-domain-select" className="text-xs text-text-muted whitespace-nowrap">
                Domain:
              </label>
              <select
                id="weak-spot-domain-select"
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="input-field py-1.5 px-2.5 text-xs rounded-xl cursor-pointer"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--surface-border)',
                }}
              >
                {DOMAIN_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="weak-spot-diff-select" className="text-xs text-text-muted whitespace-nowrap">
                Difficulty:
              </label>
              <select
                id="weak-spot-diff-select"
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="input-field py-1.5 px-2.5 text-xs rounded-xl cursor-pointer"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--surface-border)',
                }}
              >
                {DIFFICULTY_OPTIONS.map((diff) => (
                  <option key={diff} value={diff}>
                    {diff}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action button */}
          <button
            id="btn-start-weak-spot-practice"
            onClick={handleStartFocusedPractice}
            className="btn-primary py-2.5 px-5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 cursor-pointer w-full sm:w-auto"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start focused practice</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
