import { useState, useEffect, useRef } from 'react'
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, RotateCcw, Printer, Share2,
  CheckCircle2, AlertTriangle, Sparkles, Target,
  MessageSquare, BookOpen, ChevronDown, ChevronUp, BarChart3,
  ShieldCheck, RefreshCw, Loader2, Briefcase,
} from 'lucide-react'
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from '../components/ThemeToggle'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// ─── Visual Score Gauge Component ──────────────────────────────────────────
function ScoreGauge({ score = 0, verdict = 'Strong' }) {
  const radius = 64
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference

  const getColor = (s) => {
    if (s >= 80) return '#10B981' // Green
    if (s >= 65) return '#6366F1' // Indigo
    if (s >= 50) return '#F59E0B' // Amber
    return '#EF4444' // Red
  }

  const color = getColor(score)

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg className="w-44 h-44 transform -rotate-90">
        <circle
          cx="88"
          cy="88"
          r={radius}
          stroke="var(--surface-border)"
          strokeWidth="12"
          fill="transparent"
        />
        <motion.circle
          cx="88"
          cy="88"
          r={radius}
          stroke={color}
          strokeWidth="12"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-4xl font-extrabold text-text-primary tracking-tight font-heading"
        >
          {score}
          <span className="text-xl font-normal text-text-muted">/100</span>
        </motion.span>
        <span
          className="text-xs font-semibold px-2.5 py-0.5 mt-1 rounded-full uppercase tracking-wider"
          style={{
            color,
            background: `${color}15`,
            border: `1px solid ${color}30`,
          }}
        >
          {verdict}
        </span>
      </div>
    </div>
  )
}

// ─── Dynamic Radar Chart (SVG based for bulletproof rendering) ──────────────
function SkillRadarSVG({ skills = {} }) {
  const axes = [
    { key: 'technical_accuracy', label: 'Technical Accuracy' },
    { key: 'communication', label: 'Communication' },
    { key: 'problem_solving', label: 'Problem Solving' },
    { key: 'depth_of_knowledge', label: 'Depth of Knowledge' },
    { key: 'confidence', label: 'Confidence' },
  ]

  const size = 260
  const center = size / 2
  const maxRadius = 95
  const totalAxes = axes.length

  const getCoordinates = (index, value) => {
    const angle = (Math.PI * 2 / totalAxes) * index - Math.PI / 2
    const r = (value / 100) * maxRadius
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    }
  }

  // Calculate polygon points
  const points = axes.map((axis, i) => {
    const val = skills[axis.key] ?? 70
    const coords = getCoordinates(i, val)
    return `${coords.x},${coords.y}`
  }).join(' ')

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="overflow-visible">
        {/* Background concentric webs */}
        {[0.25, 0.5, 0.75, 1].map((level) => {
          const webPoints = axes.map((_, i) => {
            const coords = getCoordinates(i, level * 100)
            return `${coords.x},${coords.y}`
          }).join(' ')
          return (
            <polygon
              key={level}
              points={webPoints}
              fill="transparent"
              stroke="var(--surface-border)"
              strokeWidth="1"
            />
          )
        })}

        {/* Axis lines */}
        {axes.map((_, i) => {
          const outer = getCoordinates(i, 100)
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={outer.x}
              y2={outer.y}
              stroke="var(--surface-border)"
              strokeWidth="1"
            />
          )
        })}

        {/* Data polygon */}
        <motion.polygon
          points={points}
          initial={{ opacity: 0, scale: 0.2 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ transformOrigin: `${center}px ${center}px` }}
          fill="rgba(99, 102, 241, 0.25)"
          stroke="#6366F1"
          strokeWidth="2.5"
        />

        {/* Data dots */}
        {axes.map((axis, i) => {
          const val = skills[axis.key] ?? 70
          const coords = getCoordinates(i, val)
          return (
            <circle
              key={i}
              cx={coords.x}
              cy={coords.y}
              r="4"
              fill="#8B5CF6"
              stroke="#F8F8FF"
              strokeWidth="1.5"
            />
          )
        })}

        {/* Axis Labels */}
        {axes.map((axis, i) => {
          const outer = getCoordinates(i, 118)
          const val = skills[axis.key] ?? 70
          return (
            <text
              key={i}
              x={outer.x}
              y={outer.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[10px] fill-current text-text-secondary font-medium"
            >
              {axis.label} ({val}%)
            </text>
          )
        })}
      </svg>
    </div>
  )
}

// ─── Main Report Page ───────────────────────────────────────────────────────
export default function Report() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const hasSavedRef = useRef(false)

  const [loading, setLoading] = useState(true)
  const [reportData, setReportData] = useState(null)
  const [sessionMeta, setSessionMeta] = useState(null)
  const [expandedQuestion, setExpandedQuestion] = useState(0)
  const [copiedLink, setCopiedLink] = useState(false)
  const [isServerWaking, setIsServerWaking] = useState(false)
  const [reportError, setReportError] = useState(null)

  const fetchOrCreateReport = async () => {
    setLoading(true)
    setReportError(null)

    const wakeTimer = setTimeout(() => {
      setIsServerWaking(true)
    }, 3000)

    try {
      const stateData = location.state

      // 1. If passed from Interview completion
      if (stateData && stateData.qaHistory) {
        const { qaHistory, config, fillerCount, sessionId } = stateData

        let finalReport = null

        try {
          // Call backend report generator
          const res = await axios.post(`${API_BASE}/api/report/generate`, {
            sessionId: sessionId || id,
            domain: config?.domain || 'General',
            difficulty: config?.difficulty || 'Medium',
            interviewType: config?.type || 'Technical',
            fillerCount: fillerCount || 0,
            qa_pairs: qaHistory,
          })

          if (res.data?.report) {
            finalReport = res.data.report
          }
        } catch (err) {
          console.warn('Backend report error, computing from local qaHistory:', err)
        }

        // Map per-question evaluations
        let finalQuestions = []
        if (finalReport?.per_question && finalReport.per_question.length > 0) {
          finalQuestions = finalReport.per_question.map((pq, idx) => ({
            question: pq.question || qaHistory[idx]?.question || `Question ${idx + 1}`,
            answer: pq.answer || qaHistory[idx]?.answer || '',
            score: typeof pq.score === 'number' ? pq.score : 70,
            feedback: pq.feedback || '',
            ideal_answer: pq.ideal_answer || '',
            strengths: pq.strengths || [],
            improvements: pq.improvements || [],
          }))
        } else {
          finalQuestions = qaHistory.map((q, idx) => {
            const answerText = (q.answer || '').trim()
            const wordCount = answerText ? answerText.split(/\s+/).filter(Boolean).length : 0
            const isSkipped = q.skipped || !answerText || answerText.toLowerCase().includes('skipped')

            let fallbackScore = 75
            let feedback = 'Good answer addressing the core concepts.'
            let strengths = ['Identified core terminology and approach']
            let improvements = ['Deepen implementation trade-offs']

            if (isSkipped) {
              fallbackScore = 25
              feedback = 'No answer provided for this question. In an interview, offering an educated attempt is always better than skipping.'
              strengths = []
              improvements = ['Always attempt a high-level conceptual framework even when unsure']
            } else if (wordCount < 15) {
              fallbackScore = 38
              feedback = 'Answer was very brief and lacked required technical depth.'
              strengths = ['Addressed topic direction']
              improvements = ['Elaborate on mechanisms and concrete examples']
            } else if (wordCount < 35) {
              fallbackScore = 58
              feedback = 'Covers basic definitions but omits edge cases, scale constraints, and architectural details.'
              strengths = ['Clear communication', 'Understood basic question premise']
              improvements = ['Include runtime complexities and concrete trade-offs']
            } else if (wordCount < 65) {
              fallbackScore = 78
              feedback = 'Solid, well-structured response with good domain terminology and clear logic.'
              strengths = ['Methodical approach', 'Accurate domain concepts explained']
              improvements = ['Include production scale considerations']
            } else {
              fallbackScore = 88
              feedback = 'Excellent, detailed response demonstrating thorough domain mastery and strong technical articulation.'
              strengths = ['Comprehensive coverage', 'Clear technical structure', 'Strong depth']
              improvements = ['Mention extreme-scale edge cases']
            }

            return {
              question: q.question || `Question ${idx + 1}`,
              answer: answerText || '(Candidate skipped this question)',
              score: fallbackScore,
              feedback,
              ideal_answer: q.ideal_answer || `A strong response explains the core principles of ${config?.domain || 'this topic'}, runtime complexity, and practical trade-offs.`,
              strengths,
              improvements,
            }
          })
        }

        const computedAvg = finalQuestions.length
          ? Math.round(finalQuestions.reduce((a, b) => a + b.score, 0) / finalQuestions.length)
          : 72

        const overallScore = typeof finalReport?.overall_score === 'number' ? finalReport.overall_score : computedAvg
        const overallVerdict =
          finalReport?.overall_verdict ||
          (overallScore >= 85 ? 'Exceptional' : overallScore >= 70 ? 'Strong' : overallScore >= 50 ? 'Average' : 'Needs Work')

        const completedReport = {
          ...(finalReport || {}),
          overall_score: overallScore,
          overall_verdict: overallVerdict,
          summary:
            finalReport?.summary ||
            `Candidate demonstrated ${overallVerdict.toLowerCase()} command across ${config?.domain || 'core'} concepts under ${config?.difficulty || 'Medium'} interview conditions.`,
          skill_radar: finalReport?.skill_radar || {
            technical_accuracy: Math.min(95, overallScore + 2),
            communication: Math.min(95, overallScore - 2),
            problem_solving: Math.min(95, overallScore + 1),
            depth_of_knowledge: Math.min(95, overallScore - 4),
            confidence: Math.min(95, overallScore + 3),
          },
          top_strengths: finalReport?.top_strengths || [
            'Methodical problem-solving thought process',
            `Solid grasp of foundational ${config?.domain || 'technical'} concepts`,
            'Consistent effort throughout the mock interview',
          ],
          top_improvements: finalReport?.top_improvements || [
            'Provide deeper analysis of edge cases and architectural trade-offs',
            'Elaborate on production failure modes and scalability considerations',
            'Reduce conversational pause duration under timed conditions',
          ],
          studyPlan: finalReport?.studyPlan || [
            { day: 'Day 1-2', topic: `${config?.domain || 'Domain'} Core Theory`, task: 'Review core definitions, system invariants, and data structures.' },
            { day: 'Day 3-4', topic: 'Hands-on Practice', task: 'Solve 5 practical architectural scenarios focusing on edge cases.' },
            { day: 'Day 5-7', topic: 'Timed Mock Practice', task: 'Practice articulate vocal delivery under strict time constraints.' },
          ],
          filler_word_count: fillerCount || 0,
          confidence_rating: overallScore >= 75 ? 'High' : overallScore >= 50 ? 'Medium' : 'Low',
          recommended_resources: finalReport?.recommended_resources || [
            { topic: config?.domain || 'DSA', type: 'Course', suggestion: `Advanced ${config?.domain || 'Technical'} Masterclass` },
            { topic: 'System Design', type: 'Book', suggestion: 'Designing Data-Intensive Applications' },
          ],
          next_steps: finalReport?.next_steps || 'Review the question-by-question feedback below and target specific weak areas in your next session.',
          per_question: finalQuestions,
        }

        setReportData(completedReport)
        setSessionMeta({
          config,
          fillerCount,
          sessionId,
          qaHistory: finalQuestions,
        })

        // Save report to Firestore collection "reports"
        const targetUser = user || auth.currentUser
        if (!hasSavedRef.current && targetUser) {
          hasSavedRef.current = true
          try {
            const reportDoc = {
              userId: targetUser.uid,
              userName: targetUser.displayName || targetUser.email?.split('@')[0] || 'Candidate',
              domain: config?.domain || 'General',
              difficulty: config?.difficulty || 'Medium',
              type: config?.type || 'Technical',
              totalScore: overallScore,
              verdict: overallVerdict,
              questions: finalQuestions.map((q) => ({
                question: q.question,
                answer: q.answer,
                score: q.score,
                feedback: q.feedback || '',
                ideal_answer: q.ideal_answer || '',
                strengths: q.strengths || [],
                improvements: q.improvements || [],
              })),
              radarScores: completedReport.skill_radar,
              strengths: completedReport.top_strengths,
              improvements: completedReport.top_improvements,
              studyPlan: completedReport.studyPlan,
              createdAt: serverTimestamp(),
            }
            if (config?.hasJobDescription || config?.jobTitle) {
              reportDoc.hasJobDescription = true
              reportDoc.jobTitle = (config?.jobTitle || '').slice(0, 60)
            }
            await addDoc(collection(db, 'reports'), reportDoc)
            console.log('Report saved to Firestore reports collection')
          } catch (fsErr) {
            console.error('Error saving report to Firestore:', fsErr)
          }
        }

        setLoading(false)
        return
      }

      // 2. If accessed by ID via Firestore
      if (id && !id.startsWith('local_')) {
        try {
          // Check "reports" collection first
          let snap = await getDoc(doc(db, 'reports', id))
          if (!snap.exists()) {
            // Check legacy "interviews" collection
            snap = await getDoc(doc(db, 'interviews', id))
          }

          if (snap.exists()) {
            const data = snap.data()
            const avgScore = data.totalScore ?? data.score ?? 75
            const verdict = data.verdict || (avgScore >= 80 ? 'Exceptional' : avgScore >= 65 ? 'Strong' : 'Average')

            const questionsList = (data.questions || data.qaHistory || []).map((q, idx) => ({
              question: q.question || `Question ${idx + 1}`,
              answer: q.answer || '',
              score: typeof q.score === 'number' ? q.score : avgScore,
              feedback: q.feedback || '',
              ideal_answer: q.ideal_answer || '',
              strengths: q.strengths || [],
              improvements: q.improvements || [],
            }))

            setReportData({
              overall_score: avgScore,
              overall_verdict: verdict,
              summary: data.summary || `Performance record for ${data.domain || 'Technical'} mock interview (${data.difficulty || 'Medium'}).`,
              skill_radar: data.radarScores || {
                technical_accuracy: Math.min(95, avgScore + 2),
                communication: Math.min(95, avgScore - 1),
                problem_solving: Math.min(95, avgScore + 3),
                depth_of_knowledge: Math.min(95, avgScore - 3),
                confidence: Math.min(95, avgScore),
              },
              top_strengths: data.strengths || [
                'Demonstrated strong grasp of foundational topics',
                'Methodical approach to problem dissection',
              ],
              top_improvements: data.improvements || [
                'Incorporate more boundary conditions and edge cases',
                'Deepen operational runtime trade-off explanations',
              ],
              studyPlan: data.studyPlan || [],
              filler_word_count: data.fillerWordCount || 0,
              confidence_rating: avgScore >= 70 ? 'High' : 'Medium',
              recommended_resources: [
                { topic: data.domain || 'Tech', type: 'Course', suggestion: `${data.domain || 'Interview'} Mastery` },
              ],
              next_steps: 'Continue structured mock practice sessions regularly.',
              per_question: questionsList,
            })

            setSessionMeta({
              config: {
                domain: data.domain,
                difficulty: data.difficulty,
                type: data.type,
                hasJobDescription: Boolean(data.hasJobDescription),
                jobTitle: data.jobTitle || '',
              },
              fillerCount: data.fillerWordCount || 0,
              sessionId: data.sessionId || id,
              qaHistory: questionsList,
            })
            setLoading(false)
            return
          }
        } catch (e) {
          console.error('Error fetching Firestore report:', e)
        }
      }

      // 3. Fallback demo data if visited directly without state
      setReportData({
        overall_score: 78,
        overall_verdict: 'Strong',
        summary: 'Solid performance demonstrating comprehensive command of core paradigms with great clarity and quick thinking.',
        skill_radar: {
          technical_accuracy: 82,
          communication: 80,
          problem_solving: 78,
          depth_of_knowledge: 74,
          confidence: 84,
        },
        top_strengths: [
          'Effective decomposition of complex questions',
          'Accurate terminology and concise descriptions',
          'Steady vocal pacing and direct answers',
        ],
        top_improvements: [
          'Include concrete real-world benchmarking stats',
          'Explore failure scenarios and recovery strategies',
        ],
        studyPlan: [
          { day: 'Day 1-2', topic: 'Core Theory', task: 'Review foundational definitions and memory models.' },
          { day: 'Day 3-4', topic: 'Applied Problems', task: 'Solve 5 hands-on architectural scenarios.' },
          { day: 'Day 5-7', topic: 'Timed Mock', task: 'Conduct timed practice under interview constraints.' },
        ],
        filler_word_count: 5,
        confidence_rating: 'High',
        recommended_resources: [
          { topic: 'Data Structures', type: 'Course', suggestion: 'Grokking the Coding Interview' },
          { topic: 'System Design', type: 'Book', suggestion: 'Designing Data-Intensive Applications' },
        ],
        next_steps: 'Practice hard-level system design questions and conduct full mock interviews weekly.',
        per_question: [
          {
            question: 'Explain the difference between a stack and a queue. When would you use each?',
            answer: 'A stack is LIFO (Last In First Out) whereas a queue is FIFO (First In First Out). Stacks are used for undo history and call stacks, while queues are used for task scheduling and BFS.',
            score: 85,
            feedback: 'Accurate distinction between LIFO and FIFO with appropriate real-world use cases.',
            strengths: ['Clear terminology', 'Good practical examples for both'],
            improvements: ['Could mention dynamic resizing complexity trade-offs'],
            ideal_answer: 'A stack follows Last-In-First-Out (LIFO), meaning elements are added and removed from the top, ideal for function call stacks, undo mechanisms, and DFS. A queue follows First-In-First-Out (FIFO), where elements enter at the rear and exit from the front, ideal for asynchronous buffers, printer queues, and BFS traversals.',
          }
        ]
      })

      setSessionMeta({
        config: { domain: 'DSA & Web Dev', difficulty: 'Medium', type: 'Technical' },
        fillerCount: 5,
        sessionId: id || 'demo-session',
        qaHistory: [
          {
            question: 'Explain the difference between a stack and a queue. When would you use each?',
            answer: 'A stack is LIFO (Last In First Out) whereas a queue is FIFO (First In First Out). Stacks are used for undo history and call stacks, while queues are used for task scheduling and BFS.',
            score: 85,
            feedback: 'Accurate distinction between LIFO and FIFO with appropriate real-world use cases.',
            strengths: ['Clear terminology', 'Good practical examples for both'],
            improvements: ['Could mention dynamic resizing complexity trade-offs'],
            ideal_answer: 'A stack follows Last-In-First-Out (LIFO), meaning elements are added and removed from the top, ideal for function call stacks, undo mechanisms, and DFS. A queue follows First-In-First-Out (FIFO), where elements enter at the rear and exit from the front, ideal for asynchronous buffers, printer queues, and BFS traversals.',
          }
        ]
      })

      setLoading(false)
    } catch (err) {
      console.error('Error in fetchOrCreateReport:', err)
      setReportError({
        title: 'Unable to Generate or Retrieve Report',
        message: err?.response?.data?.error || err?.message || 'The server took too long to respond or is still starting up. Please try again.',
      })
      setLoading(false)
    } finally {
      clearTimeout(wakeTimer)
      setIsServerWaking(false)
    }
  }

  useEffect(() => {
    fetchOrCreateReport()
  }, [id, location.state, user])

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
        <div className="glass-card p-10 flex flex-col items-center gap-4 text-center max-w-md w-full border border-surface-border">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <div className="absolute -inset-1.5 rounded-2xl border-2 border-indigo-500/40 border-t-indigo-400 animate-spin" />
          </div>

          <h2 className="text-lg font-bold text-text-primary">
            {isServerWaking
              ? 'Waking up the interview server... this can take up to a minute on first visit'
              : 'Generating Performance Report'}
          </h2>

          <p className="text-xs text-text-secondary leading-relaxed">
            {isServerWaking
              ? "Render free-tier instances sleep when idle. We're warming up the AI engine to evaluate your answers."
              : 'Synthesizing Gemini AI evaluations, radar metrics, and filler word counter…'}
          </p>

          {isServerWaking && (
            <div className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-medium text-indigo-300">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Cold-start in progress... please hold on</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  if (reportError && !reportData) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
        <div className="glass-card p-8 rounded-2xl max-w-md w-full text-center border border-red-500/25 shadow-2xl">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">
            {reportError.title}
          </h2>
          <p className="text-xs text-text-secondary mb-6 leading-relaxed">
            {reportError.message}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={fetchOrCreateReport}
              className="btn-primary flex-1 justify-center py-3 text-xs font-bold cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              Retry Report
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="btn-secondary flex-1 justify-center py-3 text-xs font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary print:bg-white print:text-black">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 h-16 border-b border-surface-border px-4 sm:px-6 flex items-center justify-between print:hidden"
        style={{ background: 'var(--nav-bg)', backdropFilter: 'blur(16px)' }}>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-secondary py-2 px-2.5 sm:px-3 text-xs"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Dashboard</span>
          </button>
          <div className="hidden md:block h-4 w-px bg-surface-border" />
          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-surface border border-surface-border text-text-primary">
              {sessionMeta?.config?.domain || 'Technical'}
            </span>
            <span className="text-xs text-text-muted">
              {sessionMeta?.config?.difficulty || 'Medium'} difficulty
            </span>
            {(sessionMeta?.config?.jobTitle || reportData?.jobTitle) && (
              <span
                className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 flex items-center gap-1.5 max-w-[200px] truncate"
                title={sessionMeta?.config?.jobTitle || reportData?.jobTitle}
              >
                <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="truncate">{sessionMeta?.config?.jobTitle || reportData?.jobTitle}</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5">
          <ThemeToggle id="theme-toggle-report" />
          <button
            onClick={handleShare}
            className="btn-secondary py-2 px-2.5 sm:px-3 text-xs"
            title="Copy Report Link"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{copiedLink ? 'Copied!' : 'Share'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="btn-secondary py-2 px-2.5 sm:px-3 text-xs"
            title="Print or Save PDF"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>

          <Link
            to="/interview"
            state={{ config: sessionMeta?.config }}
            className="btn-primary py-2 px-3 sm:px-4 text-xs font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retake</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 sm:p-8 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.04) 100%)',
            border: '1px solid rgba(99,102,241,0.2)',
          }}
        >
          <div className="flex flex-col lg:flex-row items-center gap-8 justify-between">
            {/* Left: Summary text */}
            <div className="flex-1 space-y-3 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-indigo/10 border border-brand-indigo/30 text-brand-indigo">
                <Sparkles className="w-3.5 h-3.5" /> Interview Performance Report
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight font-heading">
                Assessment Verdict:{' '}
                <span className="gradient-text-brand">{reportData.overall_verdict}</span>
              </h1>
              <p className="text-text-secondary text-sm leading-relaxed max-w-xl">
                {reportData.summary}
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2 text-xs text-text-muted">
                {(sessionMeta?.config?.jobTitle || reportData?.jobTitle) && (
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-semibold">
                    <Briefcase className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                    <span>Role: <strong className="text-text-primary">{sessionMeta?.config?.jobTitle || reportData?.jobTitle}</strong></span>
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-brand-indigo" />
                  {sessionMeta?.qaHistory?.length || 10} Questions Evaluated
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Confidence:{' '}
                  <span className="font-semibold text-text-primary">
                    {reportData.confidence_rating || 'High'}
                  </span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  Fillers Detected:{' '}
                  <span className="font-semibold text-text-primary">
                    {sessionMeta?.fillerCount ?? reportData.filler_word_count ?? 0}
                  </span>
                </span>
              </div>
            </div>

            {/* Right: Score Circular Gauge */}
            <div className="flex-shrink-0 flex items-center justify-center">
              <ScoreGauge
                score={reportData.overall_score}
                verdict={reportData.overall_verdict}
              />
            </div>
          </div>
        </motion.div>

        {/* 2-Column: Radar Chart + Key Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-6 flex flex-col items-center justify-between"
          >
            <div className="w-full flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-indigo/10 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-brand-indigo" />
                </div>
                <h2 className="text-base font-bold text-text-primary">Skill Competency Radar</h2>
              </div>
              <span className="text-xs text-text-muted">5 Key Vectors</span>
            </div>

            <div className="py-2 w-full flex items-center justify-center">
              <SkillRadarSVG skills={reportData.skill_radar} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 w-full pt-4 border-t border-surface-border text-center">
              {Object.entries(reportData.skill_radar || {}).map(([key, val]) => (
                <div key={key} className="p-1.5 rounded-lg bg-surface-DEFAULT/50">
                  <p className="text-[10px] text-text-muted truncate capitalize">
                    {key.replace('_', ' ')}
                  </p>
                  <p className="text-xs font-bold text-brand-indigo">{val}%</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Strengths & Improvements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4 flex flex-col"
          >
            {/* Top Strengths */}
            <div className="glass-card p-5 flex-1" style={{ borderLeft: '3px solid #10B981' }}>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-text-primary">Key Strengths</h3>
              </div>
              <ul className="space-y-2">
                {(reportData.top_strengths || []).map((s, idx) => (
                  <li key={idx} className="text-xs text-text-secondary flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0 mt-1.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Top Improvements */}
            <div className="glass-card p-5 flex-1" style={{ borderLeft: '3px solid #F59E0B' }}>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-text-primary">Areas for Growth</h3>
              </div>
              <ul className="space-y-2">
                {(reportData.top_improvements || []).map((s, idx) => (
                  <li key={idx} className="text-xs text-text-secondary flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Per-Question Breakdown Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-indigo" />
              Question-by-Question Deep Dive
            </h2>
            <span className="text-xs text-text-muted">Click a question to expand ideal answers</span>
          </div>

          <div className="space-y-3">
            {(sessionMeta?.qaHistory || []).map((item, index) => {
              const score = typeof item.score === 'number' ? item.score : (item.evaluation?.score ?? 70)
              const isExpanded = expandedQuestion === index

              const scoreColor = score >= 85 ? '#10B981' : score >= 70 ? '#6366F1' : score >= 40 ? '#F59E0B' : '#EF4444'
              const scoreBg = score >= 85 ? 'rgba(16,185,129,0.15)' : score >= 70 ? 'rgba(99,102,241,0.15)' : score >= 40 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)'
              const tierLabel = score >= 85 ? 'Excellent' : score >= 70 ? 'Good' : score >= 40 ? 'Partial' : 'Needs Work'

              return (
                <div
                  key={index}
                  className="glass-card transition-all overflow-hidden"
                  style={{
                    borderColor: isExpanded ? 'rgba(99,102,241,0.4)' : 'var(--surface-border)',
                  }}
                >
                  <button
                    onClick={() => setExpandedQuestion(isExpanded ? null : index)}
                    className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0"
                        style={{ background: scoreBg, color: scoreColor }}
                      >
                        Q{index + 1}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-semibold text-text-primary truncate">
                          {item.question}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-bold" style={{ color: scoreColor }}>
                            {score}/100
                          </span>
                          <span className="text-[10px] text-text-muted">· {tierLabel}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-text-muted" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-text-muted" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="px-5 pb-5 pt-1 space-y-4 border-t border-surface-border text-xs"
                    >
                      {/* Candidate Answer */}
                      <div className="p-3.5 rounded-xl bg-surface-DEFAULT/60 border border-surface-border">
                        <p className="font-semibold text-text-muted mb-1 flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-brand-indigo" /> Your Answer:
                        </p>
                        <p className="text-text-secondary leading-relaxed italic">
                          "{item.answer || '[No speech recorded / Skipped]'}"
                        </p>
                      </div>

                      {/* AI Detailed Feedback */}
                      {item.feedback && (
                        <div className="p-3.5 rounded-xl bg-surface border border-surface-border">
                          <p className="font-semibold text-text-muted mb-1 flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-brand-indigo" /> AI Assessment & Feedback:
                          </p>
                          <p className="text-text-primary leading-relaxed">{item.feedback}</p>
                        </div>
                      )}

                      {/* Strengths & Improvements tags */}
                      {((item.strengths && item.strengths.length > 0) || (item.improvements && item.improvements.length > 0)) && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {item.strengths && item.strengths.length > 0 && (
                            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                              <p className="text-[11px] font-bold text-emerald-400 mb-1.5 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Answer Strengths
                              </p>
                              <ul className="space-y-1">
                                {item.strengths.map((st, i) => (
                                  <li key={i} className="text-[11px] text-text-secondary flex items-start gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                                    <span>{st}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {item.improvements && item.improvements.length > 0 && (
                            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                              <p className="text-[11px] font-bold text-amber-400 mb-1.5 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" /> Areas to Improve
                              </p>
                              <ul className="space-y-1">
                                {item.improvements.map((imp, i) => (
                                  <li key={i} className="text-[11px] text-text-secondary flex items-start gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                                    <span>{imp}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Suggested Ideal Answer */}
                      <div
                        className="p-3.5 rounded-xl"
                        style={{
                          background: 'rgba(99,102,241,0.08)',
                          border: '1px solid rgba(99,102,241,0.2)',
                        }}
                      >
                        <p className="font-semibold text-brand-indigo mb-1 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" /> Suggested Ideal Answer:
                        </p>
                        <p className="text-text-primary leading-relaxed">
                          {item.ideal_answer ||
                            'A strong answer directly defines the primary concepts, outlines real-world use cases, and explains performance trade-offs.'}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* Recommended Resources & Next Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 space-y-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-brand-indigo" />
            <h2 className="text-base font-bold text-text-primary">Targeted Study Plan & Next Steps</h2>
          </div>

          {/* Personalized 7-Day Study Roadmap */}
          {reportData.studyPlan && reportData.studyPlan.length > 0 && (
            <div className="space-y-2 mb-2">
              <p className="text-xs font-semibold text-text-secondary">Personalized 7-Day Action Plan:</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {reportData.studyPlan.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-surface-border bg-surface-DEFAULT/70 flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-indigo">
                        {step.day}
                      </span>
                      <h4 className="text-xs font-bold text-text-primary mt-1 mb-1">{step.topic}</h4>
                      <p className="text-xs text-text-muted leading-relaxed">{step.task}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {(reportData.recommended_resources || []).map((res, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl border border-surface-border bg-surface-DEFAULT flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-indigo">
                    {res.type}
                  </span>
                  <h4 className="text-xs font-bold text-text-primary mt-1 mb-0.5">{res.topic}</h4>
                  <p className="text-xs text-text-muted">{res.suggestion}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-text-secondary leading-relaxed pt-2 border-t border-surface-border">
            <strong className="text-text-primary">Next Steps: </strong>
            {reportData.next_steps}
          </p>
        </motion.div>

        {/* Bottom Action Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-8 print:hidden">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-secondary w-full sm:w-auto py-3 px-6 text-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="btn-secondary w-full sm:w-auto py-3 px-5 text-sm justify-center"
            >
              <Printer className="w-4 h-4" /> Print / PDF
            </button>
            <Link
              to="/interview"
              state={{ config: sessionMeta?.config }}
              className="btn-primary w-full sm:w-auto py-3 px-6 text-sm justify-center"
            >
              <RotateCcw className="w-4 h-4" /> Retake Mock Interview
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
