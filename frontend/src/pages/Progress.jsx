import { useState, useEffect, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  TrendingUp, BarChart3, Target, Award, Clock, Trophy,
  AlertCircle, Brain, Play, FileText, LogOut, ArrowRight,
  Sparkles, Calendar, ChevronRight, Plus, Bell, CheckCircle2
} from 'lucide-react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import ThemeToggle from '../components/ThemeToggle'
import { NewInterviewModal } from './Dashboard'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line, Bar, Radar } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  RadialLinearScale,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
}

export default function Progress() {
  const navigate = useNavigate()
  const { user, profile, logout } = useAuth()
  const { isDark } = useTheme()

  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewInterview, setShowNewInterview] = useState(false)

  // Fetch reports from Firestore
  useEffect(() => {
    if (!user) {
      setReports([])
      setLoading(false)
      return
    }

    const fetchReports = async () => {
      try {
        const q = query(
          collection(db, 'reports'),
          where('userId', '==', user.uid)
        )
        const snap = await getDocs(q)
        let list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))

        // Fallback to legacy interviews collection if reports is empty
        if (list.length === 0) {
          try {
            const legacyQ = query(
              collection(db, 'interviews'),
              where('userId', '==', user.uid)
            )
            const legacySnap = await getDocs(legacyQ)
            list = legacySnap.docs.map((d) => ({ id: d.id, ...d.data() }))
          } catch {}
        }

        // Sort chronologically (oldest to newest) for trend analysis
        list.sort((a, b) => {
          const tA = a.createdAt?.toMillis?.() || (a.createdAt?.seconds ? a.createdAt.seconds * 1000 : 0)
          const tB = b.createdAt?.toMillis?.() || (b.createdAt?.seconds ? b.createdAt.seconds * 1000 : 0)
          return tA - tB
        })

        setReports(list)
      } catch (err) {
        console.warn('Error fetching reports for progress:', err)
        setReports([])
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [user])

  // Compute analytics
  const analytics = useMemo(() => {
    if (!reports.length) {
      return {
        totalInterviews: 0,
        avgScore: null,
        bestScore: null,
        mostPracticedDomain: null,
        weakestDomain: null,
        domainStats: [],
        timelineData: [],
        radarAverages: {
          technical_accuracy: 0,
          confidence: 0,
          communication: 0,
          problem_solving: 0,
          depth_of_knowledge: 0,
        },
      }
    }

    const totalInterviews = reports.length
    const scores = reports.map((r) => {
      const s = r.totalScore ?? r.score
      return typeof s === 'number' ? s : 70
    })

    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    const bestScore = Math.max(...scores)

    // Domain breakdown
    const domainMap = {}
    reports.forEach((r) => {
      const dom = r.domain || 'Technical'
      const score = typeof (r.totalScore ?? r.score) === 'number' ? (r.totalScore ?? r.score) : 70
      if (!domainMap[dom]) {
        domainMap[dom] = { count: 0, totalScore: 0 }
      }
      domainMap[dom].count += 1
      domainMap[dom].totalScore += score
    })

    const domainStats = Object.entries(domainMap).map(([domain, data]) => ({
      domain,
      count: data.count,
      avgScore: Math.round(data.totalScore / data.count),
    }))

    // Sort by count descending for most practiced
    const sortedByCount = [...domainStats].sort((a, b) => b.count - a.count)
    const mostPracticedDomain = sortedByCount[0] ? `${sortedByCount[0].domain} (${sortedByCount[0].count})` : null

    // Sort by avgScore ascending for weakest domain
    const sortedByScore = [...domainStats].sort((a, b) => a.avgScore - b.avgScore)
    const weakestDomain = sortedByScore[0] ? `${sortedByScore[0].domain} (${sortedByScore[0].avgScore}%)` : null

    // Chronological timeline data for line chart
    const timelineData = reports.map((r, i) => {
      let dateLabel = `Session ${i + 1}`
      if (r.createdAt?.toDate) {
        dateLabel = r.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      } else if (r.createdAt?.seconds) {
        dateLabel = new Date(r.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }
      const score = typeof (r.totalScore ?? r.score) === 'number' ? (r.totalScore ?? r.score) : 70
      return {
        label: dateLabel,
        domain: r.domain || 'Technical',
        score,
      }
    })

    // Radar averages across all reports (5 axes)
    const radarTotals = {
      technical_accuracy: 0,
      confidence: 0,
      communication: 0,
      problem_solving: 0,
      depth_of_knowledge: 0,
    }

    reports.forEach((r) => {
      const s = typeof (r.totalScore ?? r.score) === 'number' ? (r.totalScore ?? r.score) : 70
      const radar = r.radarScores || r.skill_radar || {}
      radarTotals.technical_accuracy += radar.technical_accuracy ?? Math.min(95, s + 2)
      radarTotals.confidence += radar.confidence ?? Math.min(95, s + 3)
      radarTotals.communication += radar.communication ?? Math.min(95, s - 2)
      radarTotals.problem_solving += radar.problem_solving ?? Math.min(95, s + 1)
      radarTotals.depth_of_knowledge += radar.depth_of_knowledge ?? Math.min(95, s - 4)
    })

    const radarAverages = {
      technical_accuracy: Math.round(radarTotals.technical_accuracy / totalInterviews),
      confidence: Math.round(radarTotals.confidence / totalInterviews),
      communication: Math.round(radarTotals.communication / totalInterviews),
      problem_solving: Math.round(radarTotals.problem_solving / totalInterviews),
      depth_of_knowledge: Math.round(radarTotals.depth_of_knowledge / totalInterviews),
    }

    return {
      totalInterviews,
      avgScore,
      bestScore,
      mostPracticedDomain,
      weakestDomain,
      domainStats,
      timelineData,
      radarAverages,
    }
  }, [reports])

  // Colors based on current theme
  const chartTheme = useMemo(() => {
    return {
      gridColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
      textColor: isDark ? '#94A3B8' : '#475569',
      tooltipBg: isDark ? '#16161F' : '#FFFFFF',
      tooltipBorder: isDark ? '#1E1E2E' : '#E2E8F0',
      tooltipText: isDark ? '#F8F8FF' : '#111111',
    }
  }, [isDark])

  // ── Chart 1: Line Chart Data (Score Over Time) ──────────────────────────
  const lineChartData = {
    labels: analytics.timelineData.map((d) => d.label),
    datasets: [
      {
        label: 'Overall Score',
        data: analytics.timelineData.map((d) => d.score),
        borderColor: '#7C3AED',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx
          const gradient = ctx.createLinearGradient(0, 0, 0, 300)
          gradient.addColorStop(0, 'rgba(124, 58, 237, 0.35)')
          gradient.addColorStop(1, 'rgba(124, 58, 237, 0.0)')
          return gradient
        },
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#7C3AED',
        pointBorderColor: isDark ? '#111118' : '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointHoverBackgroundColor: '#6366F1',
        pointHoverBorderColor: '#FFFFFF',
        pointHoverBorderWidth: 2,
      },
    ],
  }

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: chartTheme.tooltipBg,
        borderColor: chartTheme.tooltipBorder,
        borderWidth: 1,
        titleColor: chartTheme.tooltipText,
        bodyColor: chartTheme.tooltipText,
        padding: 12,
        cornerRadius: 10,
        boxPadding: 6,
        callbacks: {
          label: (context) => {
            const item = analytics.timelineData[context.dataIndex]
            return `Score: ${context.parsed.y}% (${item?.domain || 'Session'})`
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: chartTheme.gridColor,
          drawBorder: false,
        },
        ticks: {
          color: chartTheme.textColor,
          font: { family: 'Inter', size: 11 },
        },
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          color: chartTheme.gridColor,
          drawBorder: false,
        },
        ticks: {
          color: chartTheme.textColor,
          font: { family: 'Inter', size: 11 },
          stepSize: 20,
          callback: (value) => `${value}%`,
        },
      },
    },
  }

  // ── Chart 2: Bar Chart Data (Score by Domain) ───────────────────────────
  const barChartData = {
    labels: analytics.domainStats.map((d) => d.domain),
    datasets: [
      {
        label: 'Average Score',
        data: analytics.domainStats.map((d) => d.avgScore),
        backgroundColor: '#7C3AED',
        hoverBackgroundColor: '#6D28D9',
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 45,
      },
    ],
  }

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: chartTheme.tooltipBg,
        borderColor: chartTheme.tooltipBorder,
        borderWidth: 1,
        titleColor: chartTheme.tooltipText,
        bodyColor: chartTheme.tooltipText,
        padding: 12,
        cornerRadius: 10,
        callbacks: {
          label: (context) => {
            const dom = analytics.domainStats[context.dataIndex]
            return `Average: ${context.parsed.y}% (${dom?.count || 1} ${dom?.count === 1 ? 'interview' : 'interviews'})`
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: chartTheme.textColor,
          font: { family: 'Inter', size: 11, weight: '500' },
        },
      },
      y: {
        min: 0,
        max: 100,
        grid: {
          color: chartTheme.gridColor,
          drawBorder: false,
        },
        ticks: {
          color: chartTheme.textColor,
          font: { family: 'Inter', size: 11 },
          stepSize: 20,
          callback: (value) => `${value}%`,
        },
      },
    },
  }

  // ── Chart 3: Radar Chart Data (Average Skills) ──────────────────────────
  const radarLabels = [
    'Technical Accuracy',
    'Confidence',
    'Communication',
    'Problem Solving',
    'Depth of Knowledge',
  ]

  const radarChartData = {
    labels: radarLabels,
    datasets: [
      {
        label: 'Average Skill Level',
        data: [
          analytics.radarAverages.technical_accuracy,
          analytics.radarAverages.confidence,
          analytics.radarAverages.communication,
          analytics.radarAverages.problem_solving,
          analytics.radarAverages.depth_of_knowledge,
        ],
        backgroundColor: 'rgba(124, 58, 237, 0.22)',
        borderColor: '#7C3AED',
        borderWidth: 2.5,
        pointBackgroundColor: '#8B5CF6',
        pointBorderColor: isDark ? '#111118' : '#FFFFFF',
        pointHoverBackgroundColor: '#7C3AED',
        pointHoverBorderColor: '#FFFFFF',
        pointRadius: 4.5,
        pointHoverRadius: 7,
      },
    ],
  }

  const radarChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: chartTheme.tooltipBg,
        borderColor: chartTheme.tooltipBorder,
        borderWidth: 1,
        titleColor: chartTheme.tooltipText,
        bodyColor: chartTheme.tooltipText,
        padding: 12,
        cornerRadius: 10,
        callbacks: {
          label: (context) => `Average: ${context.parsed.r}%`,
        },
      },
    },
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          display: false,
          stepSize: 20,
        },
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.08)',
        },
        angleLines: {
          color: isDark ? 'rgba(255, 255, 255, 0.09)' : 'rgba(0, 0, 0, 0.08)',
        },
        pointLabels: {
          color: isDark ? '#F8F8FF' : '#111111',
          font: { family: 'Inter', size: 11, weight: '600' },
        },
      },
    },
  }

  const handleStartInterview = (config) => {
    setShowNewInterview(false)
    navigate('/interview', { state: config })
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const displayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'there'
  const initials = displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()

  const summaryStats = [
    {
      label: 'Total Interviews',
      value: analytics.totalInterviews,
      sub: analytics.totalInterviews > 0 ? 'Sessions logged' : 'No interviews yet',
      icon: Clock,
      color: '#6366F1',
    },
    {
      label: 'Average Score',
      value: analytics.avgScore !== null ? `${analytics.avgScore}%` : '—',
      sub: analytics.avgScore !== null ? (analytics.avgScore >= 70 ? 'Strong readiness' : 'Keep practicing') : 'Take mock interview',
      icon: TrendingUp,
      color: '#10B981',
    },
    {
      label: 'Best Score',
      value: analytics.bestScore !== null ? `${analytics.bestScore}%` : '—',
      sub: analytics.bestScore !== null ? 'Personal record' : 'Aim high',
      icon: Trophy,
      color: '#F59E0B',
    },
    {
      label: 'Most Practiced',
      value: analytics.mostPracticedDomain || '—',
      sub: 'Top category focus',
      icon: Target,
      color: '#8B5CF6',
    },
    {
      label: 'Needs Focus',
      value: analytics.weakestDomain || '—',
      sub: 'Target for improvement',
      icon: AlertCircle,
      color: '#EF4444',
    },
  ]

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: 'var(--bg-primary)' }}
    >
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
          className="app-sidebar-logo flex items-center gap-3 px-5 h-16 flex-shrink-0 cursor-pointer"
          style={{ borderBottom: '1px solid var(--sidebar-border)' }}
          onClick={() => navigate('/dashboard')}
        >
          <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold" style={{ color: 'var(--sidebar-text)' }}>
            InterviewSense<span className="gradient-text-brand"> AI</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          {[
            { icon: BarChart3, label: 'Dashboard', action: () => navigate('/dashboard') },
            { icon: Play, label: 'New Interview', action: () => setShowNewInterview(true) },
            { icon: FileText, label: 'My Reports', action: () => navigate('/dashboard') },
            { icon: TrendingUp, label: 'Progress', active: true, action: () => navigate('/progress') },
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

      {/* Main Content */}
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
            <h1 className="text-sm sm:text-base font-bold text-text-primary flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-indigo" />
              <span>Progress & Analytics</span>
            </h1>
            <p className="text-xs text-text-muted hidden sm:block">Track your improvement, domain scores, and skill competencies over time</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle id="theme-toggle-progress" />
            <button
              onClick={() => setShowNewInterview(true)}
              className="btn-primary py-2 px-3 sm:px-4 text-xs sm:text-sm"
            >
              <Plus className="w-4 h-4" /> <span className="hidden sm:inline">New Interview</span>
            </button>
          </div>
        </header>

        <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
          {/* Summary Stats Cards */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5"
          >
            {summaryStats.map((s) => {
              const Icon = s.icon
              return (
                <motion.div
                  key={s.label}
                  variants={fadeUp}
                  className="p-4 rounded-2xl transition-all duration-200"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    boxShadow: 'var(--card-shadow)',
                  }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center"
                      style={{ background: `${s.color}15`, border: `1px solid ${s.color}30` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: s.color }} />
                    </div>
                  </div>
                  <p className="text-xl font-black truncate" style={{ color: 'var(--text-primary)' }}>
                    {s.value}
                  </p>
                  <p className="text-xs font-semibold mt-0.5 truncate" style={{ color: 'var(--text-secondary)' }}>
                    {s.label}
                  </p>
                  <p className="text-[11px] truncate mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {s.sub}
                  </p>
                </motion.div>
              )
            })}
          </motion.div>

          {loading ? (
            <div
              className="flex flex-col items-center justify-center py-24 rounded-2xl"
              style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
              }}
            >
              <div className="w-9 h-9 border-2 border-brand-indigo border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
                Loading your interview analytics…
              </p>
            </div>
          ) : reports.length === 0 ? (
            // Empty State
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl"
              style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                boxShadow: 'var(--card-shadow)',
              }}
            >
              <div className="w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/25">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                No Progress Data Yet
              </h3>
              <p className="text-sm max-w-md mb-6" style={{ color: 'var(--text-secondary)' }}>
                Complete your first mock interview session to unlock comprehensive score trend lines, domain performance benchmarks, and radar competency profiles.
              </p>
              <button
                onClick={() => setShowNewInterview(true)}
                className="btn-primary py-3 px-6 text-sm font-bold shadow-lg shadow-indigo-500/25"
              >
                Start First Mock Interview <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </motion.div>
          ) : (
            // Charts Grid
            <div className="space-y-6">
              {/* Row 1: Line Chart (Score Over Time) & Radar Chart (Average Skills) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart 1: Score Over Time (2 columns) */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="lg:col-span-2 p-5 rounded-2xl flex flex-col"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    boxShadow: 'var(--card-shadow)',
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <span className="w-2 h-2 rounded-full bg-purple-500" />
                        Score Over Time
                      </h2>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        Overall interview performance improvement trend across sessions
                      </p>
                    </div>
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{
                        backgroundColor: 'rgba(124, 58, 237, 0.12)',
                        color: '#7C3AED',
                        border: '1px solid rgba(124, 58, 237, 0.25)',
                      }}
                    >
                      {analytics.totalInterviews} {analytics.totalInterviews === 1 ? 'Session' : 'Sessions'}
                    </span>
                  </div>

                  <div className="h-64 sm:h-72 w-full mt-2">
                    <Line data={lineChartData} options={lineChartOptions} />
                  </div>
                </motion.div>

                {/* Chart 3: Radar Chart — Average Skills */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-2xl flex flex-col"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    boxShadow: 'var(--card-shadow)',
                  }}
                >
                  <div className="mb-2">
                    <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      Average Skills Radar
                    </h2>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      Core competency benchmark averaged across all interviews
                    </p>
                  </div>

                  <div className="h-64 sm:h-72 w-full flex items-center justify-center">
                    <Radar data={radarChartData} options={radarChartOptions} />
                  </div>
                </motion.div>
              </div>

              {/* Row 2: Bar Chart (Score by Domain) & Recommendations */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart 2: Score by Domain (2 columns) */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="lg:col-span-2 p-5 rounded-2xl flex flex-col"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    boxShadow: 'var(--card-shadow)',
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                        <span className="w-2 h-2 rounded-full bg-violet-500" />
                        Score by Domain
                      </h2>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                        Average proficiency across technical and behavioral categories
                      </p>
                    </div>
                  </div>

                  <div className="h-64 sm:h-72 w-full mt-2">
                    <Bar data={barChartData} options={barChartOptions} />
                  </div>
                </motion.div>

                {/* Domain Focus & Growth Insights */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-5 rounded-2xl flex flex-col justify-between"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    border: '1px solid var(--card-border)',
                    boxShadow: 'var(--card-shadow)',
                  }}
                >
                  <div>
                    <h2 className="text-sm font-bold mb-1 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <Sparkles className="w-4 h-4 text-brand-indigo" />
                      Domain Mastery Insights
                    </h2>
                    <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                      Identified strengths and recommended practice areas
                    </p>

                    <div className="space-y-3">
                      {analytics.domainStats.map((item) => {
                        const isStrong = item.avgScore >= 70
                        const isAverage = item.avgScore >= 50 && item.avgScore < 70
                        const color = isStrong ? '#10B981' : isAverage ? '#F59E0B' : '#EF4444'

                        return (
                          <div
                            key={item.domain}
                            className="p-3 rounded-xl border transition-all"
                            style={{
                              backgroundColor: 'var(--pill-bg)',
                              borderColor: 'var(--surface-border)',
                            }}
                          >
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                                {item.domain}
                              </span>
                              <span className="font-bold" style={{ color }}>
                                {item.avgScore}%
                              </span>
                            </div>
                            <div
                              className="h-1.5 rounded-full overflow-hidden"
                              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}
                            >
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${item.avgScore}%`,
                                  backgroundColor: color,
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
                              <span>{item.count} {item.count === 1 ? 'interview' : 'interviews'}</span>
                              <span>{isStrong ? 'Well prepared' : isAverage ? 'Needs review' : 'High priority'}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t" style={{ borderColor: 'var(--surface-border)' }}>
                    <button
                      onClick={() => setShowNewInterview(true)}
                      className="w-full btn-primary py-2.5 text-xs font-semibold justify-center"
                    >
                      <Plus className="w-3.5 h-3.5" /> Practice Weakest Domain
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
