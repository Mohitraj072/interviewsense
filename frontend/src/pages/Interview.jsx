import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  Code2,
  Globe,
  Cpu,
  Database,
  Layers,
  Boxes,
  Mic,
  MicOff,
  Keyboard,
  ArrowRight,
  SkipForward,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Sparkles,
  Edit3,
  Check,
  X,
  Upload,
  FileText,
  Trash2,
  RefreshCw,
  Briefcase,
  ShieldCheck,
} from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from '../components/ThemeToggle'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// ── Domains list ──────────────────────────────────────────────────────────────
const DOMAINS = [
  {
    id: 'DSA',
    name: 'DSA',
    title: 'Data Structures & Algorithms',
    desc: 'Arrays, Trees, Graphs, DP, Recursion',
    icon: Code2,
    gradient: 'from-[#6366F1] to-[#8B5CF6]',
  },
  {
    id: 'Web Dev',
    name: 'Web Dev',
    title: 'Web Development',
    desc: 'React, Node.js, DOM, APIs, Async JS',
    icon: Globe,
    gradient: 'from-[#3B82F6] to-[#06B6D4]',
  },
  {
    id: 'OS',
    name: 'OS',
    title: 'Operating Systems',
    desc: 'Processes, Threads, Memory, Paging, Locks',
    icon: Cpu,
    gradient: 'from-[#10B981] to-[#059669]',
  },
  {
    id: 'DBMS',
    name: 'DBMS',
    title: 'Database Management',
    desc: 'SQL, ACID, Indexes, Normalization, Sharding',
    icon: Database,
    gradient: 'from-[#F59E0B] to-[#D97706]',
  },
  {
    id: 'System Design',
    name: 'System Design',
    title: 'System Design',
    desc: 'Scalability, Load Balancers, Caching, Microservices',
    icon: Layers,
    gradient: 'from-[#8B5CF6] to-[#EC4899]',
  },
  {
    id: 'OOPs',
    name: 'OOPs',
    title: 'OOPs & Architecture',
    desc: 'SOLID, Polymorphism, Abstraction, Design Patterns',
    icon: Boxes,
    gradient: 'from-[#EC4899] to-[#F43F5E]',
  },
]

// ── Filler words configuration & analytics ──────────────────────────────────
export const DEFINITE_FILLERS = [
  'um', 'uh', 'you know', 'basically', 'actually', 'literally', 'sort of', 'kind of', 'i mean'
]
export const POSSIBLE_FILLERS = ['like', 'so']
export const ALL_FILLERS = [...DEFINITE_FILLERS, ...POSSIBLE_FILLERS]

export const countFillers = (text = '') => {
  const lower = text.toLowerCase()
  return ALL_FILLERS.reduce((acc, word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    return acc + (lower.match(regex) || []).length
  }, 0)
}

export function computeSpeakingAnalytics(text = '', durationSec = 0) {
  const clean = (text || '').trim()
  const safeDuration = Math.max(0, Math.round(durationSec))
  if (!clean) {
    return {
      tooShort: true,
      wordCount: 0,
      durationSec: safeDuration,
      wpm: null,
      fillerCount: 0,
      definiteFillerCount: 0,
      possibleFillerCount: 0,
      fillerBreakdown: {},
    }
  }

  const words = clean.split(/\s+/).filter(Boolean)
  const wordCount = words.length

  // Voice answers that are too short to measure (under 8 seconds or under 15 words)
  // should show "Answer too short to analyze", not invented numbers.
  if (safeDuration < 8 || wordCount < 15) {
    return {
      tooShort: true,
      wordCount,
      durationSec: safeDuration,
      wpm: null,
      fillerCount: 0,
      definiteFillerCount: 0,
      possibleFillerCount: 0,
      fillerBreakdown: {},
    }
  }

  const wpm = Math.round((wordCount / Math.max(1, safeDuration)) * 60)

  const lower = clean.toLowerCase()
  const fillerBreakdown = {}
  let definiteCount = 0
  let possibleCount = 0

  ALL_FILLERS.forEach((phrase) => {
    const regex = new RegExp(`\\b${phrase}\\b`, 'gi')
    const matches = lower.match(regex)
    const count = matches ? matches.length : 0
    if (count > 0) {
      fillerBreakdown[phrase] = count
      if (POSSIBLE_FILLERS.includes(phrase)) {
        possibleCount += count
      } else {
        definiteCount += count
      }
    }
  })

  const fillerCount = definiteCount + possibleCount

  return {
    tooShort: false,
    wpm,
    wordCount,
    durationSec: safeDuration,
    fillerCount,
    definiteFillerCount: definiteCount,
    possibleFillerCount: possibleCount,
    fillerBreakdown,
  }
}

// ── Web Speech Recognition Hook ───────────────────────────────────────────────
function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimTranscript, setInterimTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(true)
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)
  const activeListeningRef = useRef(false)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setIsSupported(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      let currentInterim = ''
      let currentFinal = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i]
        if (item.isFinal) {
          currentFinal += item[0].transcript + ' '
        } else {
          currentInterim += item[0].transcript
        }
      }

      if (currentFinal) {
        setTranscript((prev) => (prev ? `${prev.trim()} ${currentFinal.trim()}` : currentFinal.trim()))
      }
      setInterimTranscript(currentInterim)
    }

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech') {
        setError(event.error)
      }
    }

    recognition.onend = () => {
      // Auto-restart if user still intended to be listening
      if (activeListeningRef.current) {
        try {
          recognition.start()
        } catch {
          setIsListening(false)
          activeListeningRef.current = false
        }
      } else {
        setIsListening(false)
      }
    }

    recognitionRef.current = recognition

    return () => {
      activeListeningRef.current = false
      try {
        recognition.stop()
      } catch {}
    }
  }, [])

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return
    setError(null)
    activeListeningRef.current = true
    try {
      recognitionRef.current.start()
      setIsListening(true)
    } catch {
      // If already started, ignore error
      setIsListening(true)
    }
  }, [])

  const stopListening = useCallback(() => {
    activeListeningRef.current = false
    if (!recognitionRef.current) return
    try {
      recognitionRef.current.stop()
    } catch {}
    setIsListening(false)
    setInterimTranscript('')
  }, [])

  const resetTranscript = useCallback((initial = '') => {
    setTranscript(initial)
    setInterimTranscript('')
  }, [])

  return {
    isListening,
    transcript,
    setTranscript,
    interimTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  }
}

// ── Audio Waveform Visualizer Component ───────────────────────────────────────
function AudioWaveform({ isRecording }) {
  const bars = [14, 28, 42, 20, 36, 50, 24, 46, 32, 18, 40, 26, 48, 16]
  return (
    <div className="flex items-center justify-center gap-1.5 h-12">
      {bars.map((height, i) => (
        <motion.div
          key={i}
          className="w-1.5 rounded-full"
          style={{ background: isRecording ? '#6366F1' : 'rgba(255,255,255,0.12)' }}
          animate={
            isRecording
              ? {
                  height: [8, height, 10, height * 0.7, 8],
                  opacity: [0.6, 1, 0.7, 1, 0.6],
                }
              : { height: 6, opacity: 0.25 }
          }
          transition={
            isRecording
              ? {
                  repeat: Infinity,
                  duration: 0.9 + (i % 4) * 0.2,
                  ease: 'easeInOut',
                  delay: (i % 5) * 0.1,
                }
              : { duration: 0.3 }
          }
        />
      ))}
    </div>
  )
}

// ── Main Interview Component ──────────────────────────────────────────────────
export default function Interview() {
  const navigate = useNavigate()
  const location = useLocation()
  const incomingState = location.state
  const { user } = useAuth()

  // Setup state
  const [stage, setStage] = useState('setup') // 'setup' | 'interview'
  const [interviewType, setInterviewType] = useState('Technical') // 'Technical' | 'HR' | 'Mixed' | 'Resume-Based'
  const [selectedDomain, setSelectedDomain] = useState('DSA')
  const [difficulty, setDifficulty] = useState('Medium') // 'Easy' | 'Medium' | 'Hard'
  const [questionCount, setQuestionCount] = useState(5) // 5 | 8 | 10
  const [timePerQuestion, setTimePerQuestion] = useState(120) // in seconds: 0 | 60 | 120 | 180. Default: 2 minutes (120)
  const [timeLeft, setTimeLeft] = useState(120) // countdown in seconds
  const [loadingQuestions, setLoadingQuestions] = useState(false)
  const [isServerWaking, setIsServerWaking] = useState(false)
  const [setupError, setSetupError] = useState('')
  const [apiError, setApiError] = useState(null)

  // Job Description states
  const [jobDescription, setJobDescription] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [hasJobDescription, setHasJobDescription] = useState(false)

  // Resume-based states
  const [resumeText, setResumeText] = useState('')
  const [resumeSummary, setResumeSummary] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [isResumeActive, setIsResumeActive] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  // Weak-spot practice states
  const [weakSpots, setWeakSpots] = useState(incomingState?.weakSpots || null)

  // Support pre-configured state from Dashboard navigation
  useEffect(() => {
    if (incomingState) {
      if (incomingState.customQuestions && incomingState.customQuestions.length > 0) {
        const qList = incomingState.customQuestions.map((q) => {
          if (typeof q === 'string') {
            return { question: q, isResumeBased: Boolean(incomingState.isResumeBased || incomingState.type === 'Resume-Based') }
          }
          return {
            question: q.question || JSON.stringify(q),
            isResumeBased: Boolean(q.isResumeBased ?? (incomingState.isResumeBased || incomingState.type === 'Resume-Based')),
          }
        })
        setQuestions(qList)
        setIsResumeActive(Boolean(incomingState.isResumeBased || incomingState.type === 'Resume-Based'))
        setInterviewType(incomingState.type || 'Technical')
        setSelectedDomain(incomingState.domain || 'DSA')
        setDifficulty(incomingState.difficulty || 'Medium')
        setQuestionCount(qList.length)
        setCurrentIndex(0)
        setAnswers([])
        setTimerSeconds(0)
        setQuestionStartTime(Date.now())
        if (incomingState.timePerQuestion !== undefined) {
          setTimePerQuestion(incomingState.timePerQuestion)
          setTimeLeft(incomingState.timePerQuestion)
        }
        setStage('interview')
      } else {
        if (incomingState.type) setInterviewType(incomingState.type)
        if (incomingState.weakSpots) setWeakSpots(incomingState.weakSpots)
        if (incomingState.domain) setSelectedDomain(incomingState.domain)
        if (incomingState.difficulty) setDifficulty(incomingState.difficulty)
        if (incomingState.isResumeBased) setIsResumeActive(true)
        if (incomingState.resumeText) {
          setResumeText(incomingState.resumeText.slice(0, 6000))
          setIsResumeActive(true)
        }
        if (incomingState.jobDescription) {
          setJobDescription(incomingState.jobDescription.slice(0, 4000))
          setHasJobDescription(true)
        }
        if (incomingState.jobTitle) {
          setJobTitle(incomingState.jobTitle.slice(0, 60))
        }
        const incomingTime = incomingState.timePerQuestion !== undefined ? incomingState.timePerQuestion : incomingState.timeLimit
        if (incomingTime !== undefined) {
          setTimePerQuestion(incomingTime)
          setTimeLeft(incomingTime)
        }
        if (incomingState.autoStart) {
          handleStartInterview({
            type: incomingState.type || (incomingState.weakSpots ? 'Weak-spot practice' : 'Technical'),
            domain: incomingState.domain || 'DSA',
            difficulty: incomingState.difficulty || 'Medium',
            timePerQuestion: incomingTime !== undefined ? incomingTime : 120,
            jobDescription: incomingState.jobDescription || '',
            resumeText: incomingState.resumeText || '',
            weakSpots: incomingState.weakSpots || null,
          })
        }
      }
    }
  }, [incomingState])

  const handleResumeFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setSetupError('Please select a valid PDF file only (.pdf).')
        return
      }
      setResumeFile(file)
      setSetupError('')
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer?.files?.[0]
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setSetupError('Please upload a PDF file only (.pdf).')
        return
      }
      setResumeFile(file)
      setSetupError('')
    }
  }

  const handleRemoveResume = (e) => {
    e.stopPropagation()
    setResumeFile(null)
    setSetupError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Live session state
  const [questions, setQuestions] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState([]) // Array of { answer, skipped, duration }
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const [isManualEditing, setIsManualEditing] = useState(false)
  const [questionStartTime, setQuestionStartTime] = useState(Date.now())
  const [inputMode, setInputMode] = useState('voice') // 'voice' | 'text'
  const [followUpCount, setFollowUpCount] = useState(0) // max 2 follow-ups per session
  const [isCheckingFollowUp, setIsCheckingFollowUp] = useState(false)
  const [activeFollowUp, setActiveFollowUp] = useState(null)

  const handleModeChange = (mode) => {
    if (mode === inputMode) return
    if (mode === 'text' && isListening) {
      stopListening()
    }
    setInputMode(mode)
  }

  // Speech recognition
  const {
    isListening,
    transcript,
    setTranscript,
    interimTranscript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition()

  // Live elapsed timer
  useEffect(() => {
    let interval = null
    if (stage === 'interview') {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [stage])

  // Ref to always access latest handleAdvance without stale closures
  const handleAdvanceRef = useRef(null)

  // Countdown timer per question
  useEffect(() => {
    if (stage !== 'interview' || timePerQuestion <= 0) return

    setTimeLeft(timePerQuestion)

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [stage, currentIndex, timePerQuestion])

  // When timer hits 0:00 -> auto submit current answer and move to next question
  useEffect(() => {
    if (stage === 'interview' && timePerQuestion > 0 && timeLeft === 0) {
      if (handleAdvanceRef.current) {
        handleAdvanceRef.current(false)
      }
    }
  }, [timeLeft, stage, timePerQuestion])

  // Timer visual styling & threshold calculation
  const getTimerStyles = () => {
    if (timePerQuestion <= 0) return null

    const ratio = timeLeft / timePerQuestion
    const isUnder10 = timeLeft <= 10

    if (ratio > 0.5) {
      // Green when more than 50% time remaining
      return {
        containerClass: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
        iconClass: 'text-emerald-400',
      }
    } else if (ratio >= 0.25) {
      // Yellow when 25-50% remaining
      return {
        containerClass: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        iconClass: 'text-amber-400',
      }
    } else {
      // Red when less than 25% remaining (with red pulsing animation when under 10 seconds)
      return {
        containerClass: `bg-red-500/10 border-red-500/30 text-red-400 ${
          isUnder10 ? 'animate-pulse border-red-500 shadow-sm shadow-red-500/40' : ''
        }`,
        iconClass: 'text-red-400',
      }
    }
  }

  const timerStyles = getTimerStyles()

  // Format timer MM:SS
  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Start interview handler
  const handleStartInterview = async (overrideParams) => {
    setLoadingQuestions(true)
    setSetupError('')
    setApiError(null)

    const wakeTimer = setTimeout(() => {
      setIsServerWaking(true)
    }, 3000)

    const useType = overrideParams?.type || interviewType
    const useDomain = overrideParams?.domain || selectedDomain
    const useDifficulty = overrideParams?.difficulty || difficulty
    const useCount = overrideParams?.count || questionCount
    const useTime = overrideParams?.timePerQuestion !== undefined ? overrideParams.timePerQuestion : timePerQuestion

    const activeResumeText = (overrideParams?.resumeText !== undefined ? overrideParams.resumeText : resumeText)?.trim() || ''
    const activeJd = (overrideParams?.jobDescription !== undefined ? overrideParams.jobDescription : jobDescription)?.trim() || ''

    // Scenario 1: Resume uploaded via PDF file when no pasted resume text is provided
    if (resumeFile && !overrideParams && !activeResumeText) {
      try {
        const formData = new FormData()
        formData.append('resume', resumeFile)
        formData.append('domain', selectedDomain)
        formData.append('difficulty', difficulty)
        formData.append('count', questionCount)
        formData.append('type', interviewType)

        const response = await axios.post(`${API_BASE}/api/resume/extract`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        const rawQuestions = Array.isArray(response.data)
          ? response.data
          : response.data?.questions || []

        const cleanList = rawQuestions.map((q) => {
          if (typeof q === 'string') {
            return { question: q, isResumeBased: true }
          }
          return {
            question: q.question || String(q),
            isResumeBased: Boolean(q.isResumeBased ?? true),
          }
        })

        if (cleanList.length > 0) {
          setQuestions(cleanList)
          setIsResumeActive(true)
          setResumeSummary('')
          setCurrentIndex(0)
          setAnswers([])
          setTimerSeconds(0)
          setFollowUpCount(0)
          setIsCheckingFollowUp(false)
          setActiveFollowUp(null)
          setTimeLeft(useTime)
          setQuestionStartTime(Date.now())
          resetTranscript('')
          setStage('interview')
          return
        } else {
          throw new Error('No personalized questions returned from resume extraction.')
        }
      } catch (err) {
        console.error('Resume question generation error:', err)
        const errMsg = err?.response?.data?.error || err?.message || 'Server did not respond.'
        setApiError({
          title: 'Resume Extraction & Question Generation Failed',
          message: `Could not generate questions from your resume: ${errMsg}. If Render's server was sleeping, retrying now usually succeeds immediately.`,
          retryAction: () => handleStartInterview(overrideParams),
          allowCuratedFallback: true,
        })
      } finally {
        clearTimeout(wakeTimer)
        setIsServerWaking(false)
        setLoadingQuestions(false)
      }
      return
    }

    // Scenario 2: Standard, JD-tailored, or Resume-text question generation
    setIsResumeActive(Boolean(activeResumeText))
    const activeWeakSpots = overrideParams?.weakSpots || weakSpots || null
    if (activeWeakSpots) {
      setWeakSpots(activeWeakSpots)
      setInterviewType('Weak-spot practice')
    }

    try {
      const requestPayload = {
        type: activeWeakSpots ? 'Weak-spot practice' : useType,
        domain: useDomain,
        difficulty: useDifficulty,
        count: useCount,
        jobDescription: activeJd,
        resumeText: activeResumeText,
      }
      if (activeWeakSpots) {
        requestPayload.weakSpots = activeWeakSpots
      }

      const response = await axios.post(`${API_BASE}/api/generate-questions`, requestPayload)

      const fetchedList = Array.isArray(response.data)
        ? response.data
        : response.data?.questions || []

      const cleanList = fetchedList.map((q) => {
        if (typeof q === 'string') {
          return { question: q, isResumeBased: Boolean(activeResumeText) }
        }
        return {
          question: q.question || String(q),
          isResumeBased: Boolean(q.isResumeBased || (activeResumeText && q.isResumeBased !== false)),
        }
      })

      if (cleanList.length > 0) {
        setQuestions(cleanList)
        setIsResumeActive(Boolean(response.data?.hasResume || activeResumeText))
        if (response.data?.resumeSummary) {
          setResumeSummary(response.data.resumeSummary)
        } else {
          setResumeSummary('')
        }
        if (response.data?.jobTitle) {
          setJobTitle(response.data.jobTitle)
        }
        if (response.data?.hasJobDescription !== undefined) {
          setHasJobDescription(Boolean(response.data.hasJobDescription))
        } else if (activeJd) {
          setHasJobDescription(true)
        }
        setCurrentIndex(0)
        setAnswers([])
        setTimerSeconds(0)
        setFollowUpCount(0)
        setIsCheckingFollowUp(false)
        setActiveFollowUp(null)
        setTimeLeft(useTime)
        setQuestionStartTime(Date.now())
        resetTranscript('')
        setStage('interview')
      } else {
        throw new Error('No questions returned from backend.')
      }
    } catch (err) {
      console.warn('Backend question fetch failed:', err)
      const errMsg = err?.response?.data?.error || err?.message || 'Server did not respond.'
      setApiError({
        title: 'Interview Server Connection Issue',
        message: `Failed to connect to AI server: ${errMsg}. Render instances can take up to a minute on first wake-up. You can retry or proceed immediately with curated questions.`,
        retryAction: () => handleStartInterview(overrideParams),
        allowCuratedFallback: true,
      })
    } finally {
      clearTimeout(wakeTimer)
      setIsServerWaking(false)
      setLoadingQuestions(false)
    }
  }

  const handleProceedWithCuratedFallback = () => {
    const defaultQuestions = [
      `Explain the core architecture and fundamental principles of ${selectedDomain}.`,
      `What are the most common performance bottlenecks in ${selectedDomain} and how do you mitigate them?`,
      `Walk me through a real-world scenario where you had to solve a complex ${selectedDomain} challenge.`,
      `What are the critical trade-offs between speed, scalability, and memory consumption in ${selectedDomain}?`,
      `Describe the industry best practices for testing, monitoring, and debugging in ${selectedDomain}.`,
    ].slice(0, questionCount).map((q) => ({ question: q, isResumeBased: false }))

    setQuestions(defaultQuestions)
    setIsResumeActive(false)
    setResumeSummary('')
    setCurrentIndex(0)
    setAnswers([])
    setTimerSeconds(0)
    setFollowUpCount(0)
    setIsCheckingFollowUp(false)
    setActiveFollowUp(null)
    setTimeLeft(timePerQuestion)
    setQuestionStartTime(Date.now())
    resetTranscript('')
    setApiError(null)
    setStage('interview')
  }

  // Toggle microphone
  const toggleRecording = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  // Advance to next question or complete session
  const advanceToNextOrReport = (answerRecord) => {
    const updatedAnswers = [...answers, answerRecord]
    setAnswers(updatedAnswers)

    // Check if last question
    if (currentIndex + 1 >= questions.length) {
      // All questions completed → Redirect to report
      const measuredAnswers = updatedAnswers.filter(
        (a) => a.inputMode === 'voice' && !a.skipped && !a.tooShort && typeof a.wpm === 'number'
      )
      const totalFillers = measuredAnswers.reduce((sum, a) => sum + (a.fillerCount || 0), 0)
      const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

      const qaHistory = updatedAnswers.map((item, idx) => {
        const qaItem = {
          question: item.questionText,
          answer: item.answer || (item.skipped ? '(Candidate skipped this question)' : ''),
          questionNumber: idx + 1,
          skipped: item.skipped,
          duration: item.duration,
          inputMode: item.inputMode,
          tooShort: Boolean(item.tooShort),
          isResumeBased: Boolean(item.isResumeBased),
        }
        if (item.followUpQuestion) {
          qaItem.followUpQuestion = item.followUpQuestion
          qaItem.followUpAnswer = item.followUpAnswer || ''
          qaItem.followUpSkipped = Boolean(item.followUpSkipped)
        }
        if (typeof item.wpm === 'number' && !item.tooShort && !item.skipped) {
          qaItem.wpm = item.wpm
          qaItem.wordCount = item.wordCount
          qaItem.durationSec = item.durationSec
          qaItem.fillerCount = item.fillerCount
          qaItem.fillerBreakdown = item.fillerBreakdown
          qaItem.definiteFillerCount = item.definiteFillerCount
          qaItem.possibleFillerCount = item.possibleFillerCount
        } else if (item.inputMode === 'voice') {
          qaItem.wordCount = item.wordCount || 0
          qaItem.durationSec = item.durationSec ?? item.duration ?? 0
        }
        return qaItem
      })

      navigate('/report', {
        state: {
          qaHistory,
          resumeSummary, // In-memory session summary for evaluation
          config: {
            type: isResumeActive ? 'Resume-Based' : (weakSpots || interviewType === 'Weak-spot practice' ? 'Weak-spot practice' : interviewType),
            domain: selectedDomain,
            difficulty,
            count: questions.length,
            isResumeBased: isResumeActive,
            hasResume: isResumeActive,
            hasJobDescription: Boolean(jobDescription.trim() || hasJobDescription),
            jobTitle: (jobTitle || '').slice(0, 60),
          },
          fillerCount: totalFillers,
          sessionId,
        },
      })
    } else {
      // Advance to next question
      setCurrentIndex((prev) => prev + 1)
      resetTranscript('')
      setIsManualEditing(false)
      setQuestionStartTime(Date.now())
      if (timePerQuestion > 0) {
        setTimeLeft(timePerQuestion)
      }
    }
  }

  // Handle follow-up submission or skip
  const handleFollowUpAdvance = (skipped = false) => {
    stopListening()
    if (!activeFollowUp) return

    const followUpAnswer = skipped ? '' : transcript.trim()
    const followUpDuration = Math.round((Date.now() - questionStartTime) / 1000)
    const currentQ = questions[currentIndex]
    const currentQText = typeof currentQ === 'string' ? currentQ : currentQ?.question || ''
    const currentIsResume = Boolean(typeof currentQ === 'object' && currentQ?.isResumeBased)

    const answerRecord = {
      questionIndex: currentIndex,
      questionText: currentQText,
      isResumeBased: currentIsResume,
      answer: activeFollowUp.mainAnswer,
      skipped: false,
      duration: (activeFollowUp.mainDuration || 0) + followUpDuration,
      inputMode: activeFollowUp.mainInputMode,
      tooShort: Boolean(activeFollowUp.mainAnalytics?.tooShort),
      followUpQuestion: activeFollowUp.question,
      followUpAnswer,
      followUpSkipped: Boolean(skipped),
    }

    if (activeFollowUp.mainAnalytics) {
      answerRecord.wpm = activeFollowUp.mainAnalytics.wpm
      answerRecord.wordCount = activeFollowUp.mainAnalytics.wordCount
      answerRecord.durationSec = activeFollowUp.mainAnalytics.durationSec
      answerRecord.fillerCount = activeFollowUp.mainAnalytics.fillerCount
      answerRecord.fillerBreakdown = activeFollowUp.mainAnalytics.fillerBreakdown
      answerRecord.definiteFillerCount = activeFollowUp.mainAnalytics.definiteFillerCount
      answerRecord.possibleFillerCount = activeFollowUp.mainAnalytics.possibleFillerCount
    }

    setActiveFollowUp(null)
    advanceToNextOrReport(answerRecord)
  }

  // Complete current question and advance (or check for adaptive follow-up)
  const handleAdvance = async (skipped = false) => {
    stopListening()

    // If currently answering a follow-up question, delegate to handleFollowUpAdvance
    if (activeFollowUp) {
      handleFollowUpAdvance(skipped)
      return
    }

    const finalAnswer = skipped ? '' : transcript.trim()
    const questionDuration = Math.round((Date.now() - questionStartTime) / 1000)
    const currentQ = questions[currentIndex]
    const currentQText = typeof currentQ === 'string' ? currentQ : currentQ?.question || ''
    const currentIsResume = Boolean(typeof currentQ === 'object' && currentQ?.isResumeBased)

    // Compute speaking analytics ONLY for voice-mode answers that are not skipped
    const analytics =
      inputMode === 'voice' && !skipped
        ? computeSpeakingAnalytics(finalAnswer, questionDuration)
        : null

    const answerRecord = {
      questionIndex: currentIndex,
      questionText: currentQText,
      isResumeBased: currentIsResume,
      answer: finalAnswer,
      skipped,
      duration: questionDuration,
      inputMode,
      tooShort: Boolean(analytics?.tooShort),
    }

    if (analytics) {
      answerRecord.wpm = analytics.wpm
      answerRecord.wordCount = analytics.wordCount
      answerRecord.durationSec = analytics.durationSec
      answerRecord.fillerCount = analytics.fillerCount
      answerRecord.fillerBreakdown = analytics.fillerBreakdown
      answerRecord.definiteFillerCount = analytics.definiteFillerCount
      answerRecord.possibleFillerCount = analytics.possibleFillerCount
    }

    // Check if eligible for AI follow-up:
    // - NOT skipped
    // - At least 15 words
    // - At most 2 follow-ups per 5-question interview
    // - Never more than one follow-up per question
    const wordCount = finalAnswer.split(/\s+/).filter(Boolean).length
    const isEligibleForFollowUp = !skipped && wordCount >= 15 && followUpCount < 2

    if (isEligibleForFollowUp) {
      setIsCheckingFollowUp(true)
      try {
        const response = await axios.post(
          `${API_BASE}/api/interview/follow-up`,
          {
            question: currentQText,
            answer: finalAnswer,
            domain: selectedDomain,
            difficulty,
            jobDescription: (jobDescription || '').trim(),
          },
          { timeout: 8000 }
        )

        if (
          response.data &&
          response.data.followUp &&
          typeof response.data.followUp === 'string' &&
          response.data.followUp.trim()
        ) {
          setFollowUpCount((prev) => prev + 1)
          setActiveFollowUp({
            question: response.data.followUp.trim(),
            mainAnswer: finalAnswer,
            mainDuration: questionDuration,
            mainInputMode: inputMode,
            mainAnalytics: analytics,
          })
          resetTranscript('')
          setIsManualEditing(false)
          setQuestionStartTime(Date.now())
          if (timePerQuestion > 0) {
            setTimeLeft(timePerQuestion)
          }
          setIsCheckingFollowUp(false)
          return
        }
      } catch (err) {
        // Silently continue without a follow-up on error or >8s timeout
        console.warn('Silent continuation: follow-up check timed out or failed:', err)
      } finally {
        setIsCheckingFollowUp(false)
      }
    }

    advanceToNextOrReport(answerRecord)
  }

  // Keep ref up to date
  handleAdvanceRef.current = handleAdvance

  // Progress percentage
  const progressPercent = questions.length > 0 ? ((currentIndex) / questions.length) * 100 : 0

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: SETUP SCREEN
  // ─────────────────────────────────────────────────────────────────────────────
  if (stage === 'setup') {
    return (
      <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 text-text-primary bg-bg-primary transition-colors duration-200">
        <div className="max-w-4xl mx-auto">
          {/* Top navigation */}
          <div className="flex items-center justify-between mb-8">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors py-2 px-3 rounded-lg border border-surface-border bg-surface hover:bg-surface-hover"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Dashboard
            </Link>

            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle id="theme-toggle-interview-setup" />
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center bg-brand-gradient"
                >
                  <Brain className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs font-bold tracking-wide text-text-secondary hidden sm:inline">
                  INTERVIEW ENGINE <span className="text-[#6366F1]">PHASE 3</span>
                </span>
              </div>
            </div>
          </div>

          {/* Header Title */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-3"
              style={{ background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.25)', color: '#A5B4FC' }}>
              <Sparkles className="w-3.5 h-3.5" />
              AI Mock Session Configuration
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight">
              Configure Your Interview
            </h1>
            <p className="text-sm text-text-secondary mt-2 max-w-xl">
              Choose your domain, interview style, and difficulty. Our Gemini AI will generate tailored questions for your mock session.
            </p>
          </motion.div>

          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-5 rounded-2xl bg-red-500/10 border border-red-500/25 text-left"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-red-300">{apiError.title}</h4>
                  <p className="text-xs text-red-200/80 mt-1 leading-relaxed">{apiError.message}</p>
                  
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <button
                      type="button"
                      onClick={apiError.retryAction}
                      disabled={loadingQuestions}
                      className="px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-all flex items-center gap-1.5 shadow-md shadow-red-500/20 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingQuestions ? 'animate-spin' : ''}`} />
                      Retry Request
                    </button>

                    {apiError.allowCuratedFallback && (
                      <button
                        type="button"
                        onClick={handleProceedWithCuratedFallback}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-text-primary text-xs font-semibold transition-all cursor-pointer"
                      >
                        Continue with Curated Questions
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {setupError && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {setupError}
            </div>
          )}

          {/* Options Container */}
          <div className="space-y-8">
            {/* Resume & Job Description Inputs (Responsive Grid: side-by-side on desktop, stacked on mobile) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Paste your resume (optional) */}
              <div
                className="p-4 sm:p-6 rounded-2xl transition-all duration-200 flex flex-col justify-between"
                style={{
                  background: 'var(--card-bg)',
                  border: resumeText.trim() ? '1.5px solid rgba(99, 102, 241, 0.45)' : '1px solid var(--card-border)',
                  boxShadow: resumeText.trim() ? '0 0 25px rgba(99, 102, 241, 0.12)' : 'var(--card-shadow)',
                }}
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <label
                      htmlFor="resume-text-input"
                      className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      Paste your resume (optional)
                    </label>
                    <div className="flex items-center gap-3">
                      {resumeText.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setResumeText('')
                            setIsResumeActive(false)
                          }}
                          className="text-[11px] text-text-muted hover:text-red-400 transition-colors cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                      <span
                        className={`text-[11px] font-mono transition-colors ${
                          resumeText.length >= 6000
                            ? 'text-amber-400 font-bold'
                            : resumeText.length > 5500
                            ? 'text-amber-300'
                            : 'text-text-muted'
                        }`}
                      >
                        {resumeText.length} / 6000
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#94A3B8] mb-3">
                    We'll generate questions probing your actual projects, tools, internships, and claims.
                  </p>
                  <textarea
                    id="resume-text-input"
                    rows={5}
                    maxLength={6000}
                    value={resumeText}
                    onChange={(e) => {
                      const val = e.target.value.slice(0, 6000)
                      setResumeText(val)
                      setIsResumeActive(Boolean(val.trim()))
                    }}
                    placeholder="Paste your resume content (projects, tools, technical skills, internships, work experience)..."
                    className="w-full text-xs font-normal p-3.5 rounded-xl transition-all resize-y min-h-[110px] max-h-[280px] focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--surface-border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
                <div className="mt-3 pt-2.5 border-t border-surface-border flex items-start sm:items-center gap-2 text-[11px] text-text-muted leading-tight">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                  <span>Your resume text is used only to generate questions for this session and is not saved.</span>
                </div>
              </div>

              {/* Paste a job description (optional) */}
              <div
                className="p-4 sm:p-6 rounded-2xl transition-all duration-200 flex flex-col justify-between"
                style={{
                  background: 'var(--card-bg)',
                  border: jobDescription.trim() ? '1.5px solid rgba(99, 102, 241, 0.45)' : '1px solid var(--card-border)',
                  boxShadow: jobDescription.trim() ? '0 0 25px rgba(99, 102, 241, 0.12)' : 'var(--card-shadow)',
                }}
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <label
                      htmlFor="job-description-input"
                      className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                    >
                      <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                      Paste a job description (optional)
                    </label>
                    <div className="flex items-center gap-3">
                      {jobDescription.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setJobDescription('')
                            setJobTitle('')
                            setHasJobDescription(false)
                          }}
                          className="text-[11px] text-text-muted hover:text-red-400 transition-colors cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                      <span
                        className={`text-[11px] font-mono transition-colors ${
                          jobDescription.length >= 4000
                            ? 'text-amber-400 font-bold'
                            : jobDescription.length > 3500
                            ? 'text-amber-300'
                            : 'text-text-muted'
                        }`}
                      >
                        {jobDescription.length} / 4000
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-[#94A3B8] mb-3">
                    We'll tailor questions to this specific role and requirements.
                  </p>
                  <textarea
                    id="job-description-input"
                    rows={5}
                    maxLength={4000}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value.slice(0, 4000))}
                    placeholder="Paste role requirements, required skills, tools, or responsibilities from the job posting..."
                    className="w-full text-xs font-normal p-3.5 rounded-xl transition-all resize-y min-h-[110px] max-h-[280px] focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--surface-border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>
                <div className="mt-3 pt-2.5 border-t border-surface-border flex items-start sm:items-center gap-2 text-[11px] text-text-muted leading-tight">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5 sm:mt-0" />
                  <span>Both the resume and the job description can be used together, or either one alone, or neither.</span>
                </div>
              </div>
            </div>

            {/* 1. Interview Type */}
            <div
              className="p-6 rounded-2xl"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--card-shadow)' }}
            >
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
                1. Select Interview Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'Technical', label: 'Technical', desc: 'Code, concepts, architecture & problem solving' },
                  { id: 'HR', label: 'HR & Behavioral', desc: 'STAR situational, leadership & team culture' },
                  { id: 'Mixed', label: 'Mixed Round', desc: 'Comprehensive blend of technical & behavioral' },
                ].map((item) => {
                  const active = interviewType === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setInterviewType(item.id)}
                      className="p-4 rounded-xl text-left transition-all duration-200 cursor-pointer relative"
                      style={{
                        background: active ? 'rgba(99, 102, 241, 0.15)' : 'var(--pill-bg)',
                        border: active ? '1.5px solid #6366F1' : '1px solid var(--surface-border)',
                        boxShadow: active ? '0 0 20px rgba(99, 102, 241, 0.2)' : 'none',
                      }}
                    >
                      <div className="font-bold text-sm text-text-primary flex items-center justify-between">
                        {item.label}
                        {active && <Check className="w-4 h-4 text-[#6366F1]" />}
                      </div>
                      <div className="text-[11px] text-text-muted mt-1 leading-snug">{item.desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 2. Select Domain / Topic */}
            <div
              className="p-6 rounded-2xl"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--card-shadow)' }}
            >
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
                2. Select Domain / Topic
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {DOMAINS.map((domain) => {
                  const Icon = domain.icon
                  const active = selectedDomain === domain.id
                  return (
                    <button
                      key={domain.id}
                      type="button"
                      onClick={() => setSelectedDomain(domain.id)}
                      className="p-4 rounded-xl text-left transition-all duration-200 cursor-pointer relative group"
                      style={{
                        background: active ? 'rgba(99, 102, 241, 0.14)' : 'var(--pill-bg)',
                        border: active ? '1.5px solid #6366F1' : '1px solid var(--surface-border)',
                        boxShadow: active ? '0 0 24px rgba(99, 102, 241, 0.22)' : 'none',
                      }}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 transition-transform duration-200 ${
                          active ? 'scale-105' : 'group-hover:scale-105'
                        }`}
                        style={{
                          background: active
                            ? 'linear-gradient(135deg, #6366F1, #8B5CF6)'
                            : 'var(--pill-bg)',
                        }}
                      >
                        <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-text-muted'}`} />
                      </div>
                      <div className="font-bold text-sm text-text-primary">{domain.title}</div>
                      <div className="text-[11px] text-text-muted mt-1 line-clamp-1">{domain.desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 3. Difficulty & Question Count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Difficulty */}
              <div
                className="p-4 sm:p-6 rounded-2xl"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--card-shadow)' }}
              >
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
                  3. Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Easy', label: 'Easy', color: '#10B981', desc: 'Entry / Fresher' },
                    { id: 'Medium', label: 'Medium', color: '#F59E0B', desc: 'Mid-level' },
                    { id: 'Hard', label: 'Hard', color: '#EF4444', desc: 'Senior / Deep' },
                  ].map((lvl) => {
                    const active = difficulty === lvl.id
                    return (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => setDifficulty(lvl.id)}
                        className="py-3 px-2 rounded-xl text-center transition-all duration-200 cursor-pointer"
                        style={{
                          background: active ? `${lvl.color}15` : 'var(--pill-bg)',
                          border: active ? `1.5px solid ${lvl.color}` : '1px solid var(--surface-border)',
                          color: active ? lvl.color : 'var(--text-secondary)',
                        }}
                      >
                        <div className="font-bold text-xs">{lvl.label}</div>
                        <div className="text-[10px] opacity-75 mt-0.5">{lvl.desc}</div>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Number of Questions */}
              <div
                className="p-4 sm:p-6 rounded-2xl"
                style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--card-shadow)' }}
              >
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-3">
                  4. Number of Questions
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { count: 5, time: '~10 mins' },
                    { count: 8, time: '~18 mins' },
                    { count: 10, time: '~25 mins' },
                  ].map((q) => {
                    const active = questionCount === q.count
                    return (
                      <button
                        key={q.count}
                        type="button"
                        onClick={() => setQuestionCount(q.count)}
                        className="py-3 px-2 rounded-xl text-center transition-all duration-200 cursor-pointer"
                        style={{
                          background: active ? 'rgba(99, 102, 241, 0.15)' : 'var(--pill-bg)',
                          border: active ? '1.5px solid #6366F1' : '1px solid var(--surface-border)',
                          color: active ? '#818CF8' : 'var(--text-secondary)',
                        }}
                      >
                        <div className="font-black text-base">{q.count}</div>
                        <div className="text-[10px] text-text-muted mt-0.5">{q.time}</div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Time per Question */}
            <div
              className="p-6 rounded-2xl"
              style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)', boxShadow: 'var(--card-shadow)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Time per Question
                </label>
                <span className="text-[11px] text-text-muted flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#6366F1]" /> Auto-submits when time expires
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {[
                  { id: 'no-limit', seconds: 0, label: 'No Limit', desc: 'No timer' },
                  { id: '1-min', seconds: 60, label: '1 minute', desc: 'Fast pace' },
                  { id: '2-min', seconds: 120, label: '2 minutes', desc: 'Standard', recommended: true },
                  { id: '3-min', seconds: 180, label: '3 minutes', desc: 'In-depth' },
                ].map((opt) => {
                  const active = timePerQuestion === opt.seconds
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setTimePerQuestion(opt.seconds)}
                      className="relative py-3.5 px-3 rounded-xl text-center transition-all duration-200 cursor-pointer flex flex-col items-center justify-center"
                      style={{
                        background: active ? 'rgba(99, 102, 241, 0.15)' : 'var(--pill-bg)',
                        border: active ? '1.5px solid #6366F1' : '1px solid var(--surface-border)',
                        color: active ? '#818CF8' : 'var(--text-secondary)',
                        boxShadow: active ? '0 0 20px rgba(99, 102, 241, 0.2)' : 'none',
                      }}
                    >
                      {opt.recommended && (
                        <span
                          className="absolute -top-2.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold text-white tracking-wider shadow-sm uppercase"
                          style={{
                            background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                            border: '1px solid rgba(255, 255, 255, 0.25)',
                          }}
                        >
                          Recommended
                        </span>
                      )}
                      <div className="font-bold text-xs">{opt.label}</div>
                      <div className="text-[10px] opacity-75 mt-0.5">{opt.desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Launch Button */}
            <div className="pt-2">
              <button
                id="btn-start-interview"
                type="button"
                onClick={handleStartInterview}
                disabled={loadingQuestions}
                className="btn-primary w-full justify-center py-4 rounded-xl text-base font-bold transition-all duration-300 disabled:opacity-50 cursor-pointer shadow-lg hover:shadow-indigo-500/25"
              >
                {loadingQuestions ? (
                  <div className="flex items-center gap-2.5">
                    <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
                    <span>
                      {isServerWaking
                        ? 'Waking up the interview server... this can take up to a minute on first visit'
                        : weakSpots || interviewType === 'Weak-spot practice'
                        ? 'Generating Targeted Weak-Spot Questions...'
                        : isResumeActive || resumeText.trim()
                        ? 'Generating Resume-Based Questions...'
                        : jobDescription.trim()
                        ? 'Tailoring Questions to Job Description...'
                        : 'Generating Questions with Gemini AI...'}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>
                      {weakSpots || interviewType === 'Weak-spot practice'
                        ? 'Start Focused Weak-Spot Practice'
                        : isResumeActive || resumeText.trim()
                        ? 'Start Resume-Based Interview Session'
                        : jobDescription.trim()
                        ? 'Start Role-Tailored Interview Session'
                        : 'Start Interview Session'}
                    </span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </button>
              <p className="text-center text-xs text-[#94A3B8] mt-3">
                {resumeText.trim()
                  ? 'Gemini AI will generate targeted questions based on your resume projects, tools, and claims.'
                  : jobDescription.trim()
                  ? "Questions will be tailored to the role's skills, tools, and responsibilities while respecting your chosen difficulty."
                  : 'Microphone audio will be transcribed in real time. You can review and edit your response before submitting.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER: LIVE INTERVIEW SCREEN
  // ─────────────────────────────────────────────────────────────────────────────
  const currentQObj = questions[currentIndex]
  const currentQuestion = (typeof currentQObj === 'object' ? currentQObj?.question : currentQObj) || 'Loading question...'
  const isCurrentResumeBased = Boolean(typeof currentQObj === 'object' && currentQObj?.isResumeBased)
  const currentWordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0
  const currentFillerCount = countFillers(transcript)

  return (
    <div className="min-h-screen flex flex-col text-text-primary bg-bg-primary transition-colors duration-200">
      {/* Top Fixed Progress Bar */}
      <div className="w-full h-1 bg-surface-border relative">
        <motion.div
          className="h-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6]"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Top Bar Header */}
      <header
        className="px-4 sm:px-8 py-3.5 border-b border-surface-border flex items-center justify-between"
        style={{ background: 'var(--nav-bg)', backdropFilter: 'blur(8px)' }}
      >
        {/* Left: Question counter badge & Countdown timer */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowExitConfirm(true)}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
            title="Exit interview"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-surface-border" />
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-extrabold px-2.5 py-1 rounded-md bg-[#6366F1]/20 text-[#818CF8] border border-[#6366F1]/30">
              Q {currentIndex + 1} / {questions.length}
            </span>
            {activeFollowUp && (
              <span className="text-xs font-extrabold px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 animate-pulse">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                Follow-up
              </span>
            )}

            {/* Countdown Timer next to question counter */}
            {timePerQuestion > 0 && timerStyles && (
              <div
                id="interview-countdown-timer"
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono font-bold border transition-colors ${timerStyles.containerClass}`}
                title="Time remaining for this question"
              >
                <Clock className={`w-3.5 h-3.5 ${timerStyles.iconClass}`} />
                <span>{formatTimer(timeLeft)}</span>
              </div>
            )}

            <span className="hidden sm:inline-block text-xs font-semibold text-text-secondary">
              {selectedDomain} • {difficulty}
            </span>
            {(isResumeActive || isCurrentResumeBased) && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                Resume-based
              </span>
            )}
            {(interviewType === 'Weak-spot practice' || Boolean(weakSpots)) && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm shadow-amber-500/20">
                <Target className="w-3.5 h-3.5" />
                Weak-spot practice
              </span>
            )}
          </div>
        </div>

        {/* Right: Topic / Mode & Theme Toggle */}
        <div className="flex items-center gap-2.5 text-xs font-semibold text-text-secondary">
          {isResumeActive && (
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px]">
              <FileText className="w-3 h-3" />
              Tailored to Resume
            </span>
          )}
          <span className="px-2.5 py-1 rounded-lg bg-surface border border-surface-border text-text-primary">
            {interviewType}
          </span>
          <ThemeToggle id="theme-toggle-interview-live" />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
        {/* Question Card */}
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.35 }}
          className="p-6 sm:p-8 rounded-2xl relative overflow-hidden"
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            boxShadow: 'var(--card-shadow)',
          }}
        >
          <div className="flex items-center justify-between mb-3 text-xs font-semibold">
            {activeFollowUp ? (
              <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-text-muted font-semibold">
                Original Question {currentIndex + 1}
              </span>
            ) : isResumeActive ? (
              <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-emerald-400 font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                Resume-Personalized Question {currentIndex + 1}
              </span>
            ) : interviewType === 'Weak-spot practice' || Boolean(weakSpots) ? (
              <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-amber-400 font-bold">
                <Target className="w-3.5 h-3.5" />
                Weak-Spot Practice Question {currentIndex + 1}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-[#6366F1]">
                <Sparkles className="w-3.5 h-3.5" />
                Interview Question {currentIndex + 1}
              </span>
            )}
            <span className="text-text-muted font-normal">
              {inputMode === 'voice' ? 'Speak clearly into your microphone' : 'Type your answer in the box below'}
            </span>
          </div>

          <h2 className={`leading-relaxed ${activeFollowUp ? 'text-base sm:text-lg font-medium text-text-secondary' : 'text-xl sm:text-2xl font-bold text-text-primary'}`}>
            {currentQuestion}
          </h2>
        </motion.div>

        {/* Follow-up Question Card */}
        <AnimatePresence>
          {activeFollowUp && (
            <motion.div
              id="card-active-followup"
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="mt-4 p-5 sm:p-6 rounded-2xl relative overflow-hidden"
              style={{
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid rgba(99, 102, 241, 0.35)',
                boxShadow: '0 8px 30px rgba(99, 102, 241, 0.12)',
              }}
            >
              <div className="flex items-center justify-between mb-3 text-xs font-semibold flex-wrap gap-2">
                <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px] text-[#818CF8] font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Follow-up Question (Under Q{currentIndex + 1})
                </span>
                <span className="text-[11px] text-text-muted">
                  Answer below via {inputMode}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-text-primary leading-relaxed mb-3">
                {activeFollowUp.question}
              </h3>

              <div className="p-3 rounded-xl bg-surface/70 border border-surface-border text-xs">
                <span className="font-semibold text-text-muted">Your initial response: </span>
                <span className="text-text-secondary italic">
                  "{activeFollowUp.mainAnswer.length > 160 ? `${activeFollowUp.mainAnswer.slice(0, 160)}...` : activeFollowUp.mainAnswer}"
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center Microphone & Recording Section (Voice Mode only) */}
        <AnimatePresence mode="wait">
          {inputMode === 'voice' && (
            <motion.div
              key="voice-controls"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="my-6 flex flex-col items-center justify-center"
            >
              {/* Waveform visualizer */}
              <AudioWaveform isRecording={isListening} />

              {/* Large Microphone Button */}
              <div className="relative mt-2 mb-3">
                {/* Pulsing ring animation when listening */}
                {isListening && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-full bg-[#EF4444]"
                      animate={{ scale: [1, 1.45, 1.7], opacity: [0.6, 0.3, 0] }}
                      transition={{ repeat: Infinity, duration: 1.8, ease: 'easeOut' }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full bg-[#6366F1]"
                      animate={{ scale: [1, 1.25, 1.5], opacity: [0.5, 0.2, 0] }}
                      transition={{ repeat: Infinity, duration: 1.8, ease: 'easeOut', delay: 0.4 }}
                    />
                  </>
                )}

                <button
                  id="btn-mic-toggle"
                  type="button"
                  onClick={toggleRecording}
                  className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-xl"
                  style={{
                    background: isListening
                      ? 'linear-gradient(135deg, #EF4444, #DC2626)'
                      : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                    boxShadow: isListening
                      ? '0 0 40px rgba(239, 68, 68, 0.5)'
                      : '0 0 35px rgba(99, 102, 241, 0.4)',
                  }}
                >
                  {isListening ? (
                    <MicOff className="w-8 h-8 text-white" />
                  ) : (
                    <Mic className="w-8 h-8 text-white" />
                  )}
                </button>
              </div>

              <div className="text-center">
                <span
                  className={`text-xs font-semibold uppercase tracking-wider ${
                    isListening ? 'text-[#EF4444]' : 'text-[#94A3B8]'
                  }`}
                >
                  {isListening ? 'Recording active • Click to Stop' : 'Click microphone to start speaking'}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mode Toggle Switch (Below the microphone button) */}
        <div className="flex items-center justify-center mb-5">
          <div
            className="p-1 rounded-xl flex items-center gap-1 relative"
            style={{
              background: 'var(--pill-bg)',
              border: '1px solid var(--surface-border)',
            }}
          >
            <button
              id="mode-toggle-voice"
              type="button"
              onClick={() => handleModeChange('voice')}
              className={`relative z-10 flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                inputMode === 'voice' ? 'text-white' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Voice</span>
              {inputMode === 'voice' && (
                <motion.div
                  layoutId="activeInputModePill"
                  className="absolute inset-0 rounded-lg shadow-sm"
                  style={{
                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                    zIndex: -1,
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>

            <button
              id="mode-toggle-text"
              type="button"
              onClick={() => handleModeChange('text')}
              className={`relative z-10 flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                inputMode === 'text' ? 'text-white' : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              <Keyboard className="w-3.5 h-3.5" />
              <span>Text</span>
              {inputMode === 'text' && (
                <motion.div
                  layoutId="activeInputModePill"
                  className="absolute inset-0 rounded-lg shadow-sm"
                  style={{
                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                    zIndex: -1,
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          </div>
        </div>

        {/* Dynamic Response Box: Voice vs Text */}
        <AnimatePresence mode="wait">
          {inputMode === 'voice' ? (
            <motion.div
              key="voice-transcript-box"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-5 sm:p-6 rounded-2xl relative"
              style={{ background: 'rgba(17, 17, 24, 0.6)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">
                    Real-Time Transcript
                  </span>
                  {isListening && (
                    <span className="flex items-center gap-1.5 text-[11px] text-green-400">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      Listening...
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsManualEditing(!isManualEditing)}
                    className="text-[11px] font-medium text-[#6366F1] hover:text-[#818CF8] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    {isManualEditing ? 'Save Edit' : 'Edit Response'}
                  </button>
                </div>
              </div>

              {/* Transcript Display or Manual Edit textarea */}
              {isManualEditing ? (
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Type or edit your answer here..."
                  rows={4}
                  className="w-full bg-black/30 text-sm text-[#F8F8FF] p-3 rounded-xl border border-white/10 focus:border-[#6366F1] outline-none resize-none"
                />
              ) : (
                <div className="min-h-[90px] max-h-[140px] overflow-y-auto text-sm leading-relaxed text-[#F8F8FF]">
                  {transcript ? (
                    <>
                      <span>{transcript}</span>
                      {interimTranscript && (
                        <span className="text-[#94A3B8] italic"> {interimTranscript}</span>
                      )}
                    </>
                  ) : (
                    <span className="text-[#475569] italic">
                      Your speech will be transcribed here automatically as you answer the question...
                    </span>
                  )}
                </div>
              )}

              {/* Transcript stats footer */}
              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-[#94A3B8]">
                <div className="flex items-center gap-4">
                  <span>Words: <strong className="text-white">{currentWordCount}</strong></span>
                  <span>Filler words: <strong className={currentFillerCount > 3 ? 'text-amber-400' : 'text-white'}>{currentFillerCount}</strong></span>
                </div>
                {!isSupported && (
                  <span className="text-amber-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Speech API not supported in this browser. Use manual typing.
                  </span>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="text-answer-box"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-5 sm:p-6 rounded-2xl relative flex flex-col flex-1"
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                boxShadow: 'var(--card-shadow)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                  <Keyboard className="w-3.5 h-3.5 text-[#6366F1]" />
                  Text Response
                </span>
                <span className="text-[11px] text-text-muted">
                  Type your complete answer below
                </span>
              </div>

              <textarea
                id="text-mode-answer-textarea"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Type your answer here..."
                rows={7}
                className="w-full bg-surface text-sm text-text-primary placeholder:text-text-muted p-4 rounded-xl border border-surface-border focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1]/40 outline-none resize-none leading-relaxed transition-colors min-h-[160px] max-h-[240px]"
              />

              {/* Word count footer */}
              <div className="mt-3 pt-2.5 border-t border-surface-border flex items-center justify-between text-[11px] text-text-secondary">
                <div className="flex items-center gap-4">
                  <span>Words: <strong className="text-text-primary">{currentWordCount}</strong></span>
                  <span>Characters: <strong className="text-text-primary">{transcript.length}</strong></span>
                </div>
                <span className="text-text-muted">
                  Click "Submit Answer" when finished
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Bottom Bar */}
        {activeFollowUp ? (
          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
            <button
              id="btn-skip-followup"
              type="button"
              onClick={() => handleFollowUpAdvance(true)}
              className="btn-secondary w-full sm:w-auto px-5 py-3 text-xs font-semibold justify-center cursor-pointer"
            >
              <SkipForward className="w-4 h-4" />
              <span>Skip follow-up</span>
            </button>

            <button
              id="btn-submit-followup"
              type="button"
              onClick={() => handleFollowUpAdvance(false)}
              className="btn-primary w-full sm:w-auto py-3 px-6 sm:px-7 rounded-xl text-xs font-bold justify-center transition-all duration-200 cursor-pointer shadow-lg shadow-indigo-500/25"
            >
              <span>
                {currentIndex + 1 === questions.length ? 'Submit Follow-up & Finish' : 'Submit Follow-up & Next'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
            <button
              id="btn-skip-question"
              type="button"
              disabled={isCheckingFollowUp}
              onClick={() => handleAdvance(true)}
              className="btn-secondary w-full sm:w-auto px-5 py-3 text-xs font-semibold justify-center cursor-pointer disabled:opacity-50"
            >
              <SkipForward className="w-4 h-4" />
              <span>Skip Question</span>
            </button>

            <button
              id="btn-submit-answer"
              type="button"
              disabled={isCheckingFollowUp}
              onClick={() => handleAdvance(false)}
              className="btn-primary w-full sm:w-auto py-3 px-6 sm:px-7 rounded-xl text-xs font-bold justify-center transition-all duration-200 cursor-pointer disabled:opacity-75 shadow-lg shadow-indigo-500/25"
            >
              {isCheckingFollowUp ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-white flex-shrink-0" />
                  <span>AI analyzing for follow-up...</span>
                </div>
              ) : (
                <>
                  <span>{currentIndex + 1 === questions.length ? 'Finish & Generate Report' : 'Submit Answer'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </main>

      {/* Exit confirmation modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="glass-card w-full max-w-sm p-6"
            >
              <h3 className="text-base font-bold text-text-primary mb-2">Leave Interview Session?</h3>
              <p className="text-xs text-text-secondary mb-6 leading-relaxed">
                Your current answers in this session will not be saved if you leave before completing all questions.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowExitConfirm(false)}
                  className="btn-secondary px-4 py-2 text-xs"
                >
                  Stay
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-500 hover:bg-red-600 transition-colors cursor-pointer"
                >
                  Exit Session
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
