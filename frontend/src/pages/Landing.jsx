import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import {
  Mic, Brain, FileText, BarChart3, Shield, Zap, ArrowRight,
  ChevronRight, Play, CheckCircle, Trophy, TrendingUp,
  Cpu, Target, Github, Twitter, Linkedin,
  Sparkles, Clock, Globe, X, RefreshCw, Loader2,
  CheckCircle2, AlertCircle, BookOpen, Send
} from 'lucide-react'
import axios from 'axios'
import ThemeToggle from '../components/ThemeToggle'

// ─── Animation Variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
}

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
}

// ─── Animated Section Wrapper ─────────────────────────────────────────────────
function AnimatedSection({ children, className = '', delay = 0 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={fadeUp}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

const NAV_LINKS = [
  { id: 'features', label: 'Features' },
  { id: 'how-it-works', label: 'How It Works' },
  { id: 'why-interviewsense', label: 'Why InterviewSense' },
]

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setMobileOpen(false)
  }

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-bg-primary/80 backdrop-blur-xl border-b border-surface-border'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-bold text-text-primary tracking-tight">
            InterviewSense
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle id="theme-toggle-landing" />
          <Link to="/login" className="btn-secondary text-sm py-2 px-4">
            Sign In
          </Link>
          <Link to="/signup" className="btn-primary text-sm py-2 px-4">
            Get Started Free
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          id="mobile-menu-toggle"
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-0.5 bg-text-secondary transition-all ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-text-secondary transition-all ${mobileOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-text-secondary transition-all ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-bg-secondary border-b border-surface-border px-6 py-4 flex flex-col gap-4"
        >
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollTo(link.id)}
              className="text-text-secondary text-sm text-left hover:text-text-primary"
            >
              {link.label}
            </button>
          ))}
          <div className="flex items-center justify-between pt-2 border-t border-surface-border">
            <span className="text-xs text-text-muted font-medium">Appearance</span>
            <ThemeToggle id="theme-toggle-landing-mobile" />
          </div>
          <div className="flex flex-col gap-2 pt-2 border-t border-surface-border">
            <Link to="/login" className="btn-secondary text-sm text-center">Sign In</Link>
            <Link to="/signup" className="btn-primary text-sm justify-center">Get Started Free <ArrowRight className="w-3.5 h-3.5" /></Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  )
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
function Hero({ onOpenDemo }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
      {/* Background */}
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />

      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute top-1/3 left-1/3 w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)' }}
        />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}
      />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center gap-16">
        {/* Left: Text */}
        <div className="flex-1 text-center lg:text-left">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8"
            style={{
              color: '#6366F1',
              background: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.25)'
            }}
          >
            <Sparkles className="w-3 h-3" />
            Powered by Google Gemini
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6"
          >
            <span className="text-text-primary">Ace Every</span>
            <br />
            <span className="gradient-text-brand">Interview</span>
            <br />
            <span className="text-text-primary">with AI.</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
            className="text-lg text-text-secondary leading-relaxed mb-10 max-w-lg mx-auto lg:mx-0"
          >
            Practice realistic technical and HR interviews with an AI that listens, evaluates your answers, and gives you{' '}
            <span className="text-text-primary font-medium">real-time expert feedback</span> — so you walk in confident.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start"
          >
            <Link
              to="/signup"
              id="hero-cta-primary"
              className="btn-primary w-full sm:w-auto px-5 sm:px-6 py-3.5 text-sm sm:text-base sm:whitespace-nowrap justify-center"
            >
              Start Free Interview
              <ArrowRight className="w-4 h-4 flex-shrink-0" />
            </Link>
            <button
              id="hero-try-demo"
              type="button"
              onClick={onOpenDemo}
              className="btn-secondary w-full sm:w-auto px-5 sm:px-6 py-3.5 text-sm sm:text-base sm:whitespace-nowrap flex items-center justify-center gap-2.5 cursor-pointer hover:border-brand-indigo/50 transition-all"
            >
              <Sparkles className="w-4 h-4 text-brand-indigo flex-shrink-0" />
              <span>Try a demo</span>
            </button>
          </motion.div>

          {/* Honest feature highlights */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex items-center gap-2.5 mt-8 justify-center lg:justify-start flex-wrap"
          >
            {[
              { label: 'Free to try', icon: Sparkles },
              { label: 'Voice + text interviews', icon: Mic },
              { label: 'Built with React, Flask and Gemini', icon: Brain },
            ].map((pill) => (
              <span
                key={pill.label}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-text-secondary border border-surface-border bg-surface/60 backdrop-blur-sm"
              >
                <pill.icon className="w-3.5 h-3.5 text-brand-indigo flex-shrink-0" />
                <span>{pill.label}</span>
              </span>
            ))}
          </motion.div>
        </div>

        {/* Right: Floating Mock UI Card */}
        <motion.div
          initial={{ opacity: 0, x: 40, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex-1 flex justify-center lg:justify-end w-full"
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="relative max-w-sm w-full"
          >
            {/* Main interview card */}
            <div className="glass-card p-6 relative overflow-hidden">
              {/* Card header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand-gradient flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-text-primary">Technical Interview</p>
                    <p className="text-[10px] text-text-muted">DSA • Medium • Q3/10</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(239,68,68,0.1)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  <span className="text-[10px] font-medium text-red-400">LIVE</span>
                </div>
              </div>

              {/* Question */}
              <div className="p-4 rounded-xl mb-4" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <p className="text-xs font-medium text-text-secondary mb-1">Question 3</p>
                <p className="text-sm text-text-primary leading-relaxed font-medium">
                  Explain the time complexity of merge sort and why it's preferred over bubble sort for large datasets.
                </p>
              </div>

              {/* Voice input indicator */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-9 h-9 rounded-full bg-brand-gradient flex items-center justify-center flex-shrink-0">
                  <Mic className="w-4 h-4 text-white" />
                  <motion.div
                    animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 rounded-full bg-brand-indigo"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-end gap-0.5 h-8">
                    {[3, 6, 4, 8, 5, 7, 4, 9, 6, 5, 8, 4, 7, 5, 6].map((h, i) => (
                      <motion.div
                        key={i}
                        animate={{ scaleY: [1, h/5, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.08, ease: 'easeInOut' }}
                        className="flex-1 rounded-full bg-brand-indigo origin-bottom"
                        style={{ height: `${h * 3}px` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Transcript */}
              <div className="p-3 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  <span className="text-text-primary">"Merge sort uses divide and conquer with O(n log n) complexity...</span>
                  <span className="inline-block w-0.5 h-3.5 bg-brand-indigo ml-0.5 animate-pulse align-middle" />
                </p>
              </div>

              {/* Score preview */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Accuracy', val: '92%', color: '#10B981' },
                  { label: 'Clarity', val: '87%', color: '#6366F1' },
                  { label: 'Depth', val: '79%', color: '#F59E0B' },
                ].map((m) => (
                  <div key={m.label} className="text-center p-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="text-sm font-bold" style={{ color: m.color }}>{m.val}</p>
                    <p className="text-[9px] text-text-muted mt-0.5">{m.label}</p>
                  </div>
                ))}
              </div>

              {/* Sample interview label */}
              <div className="mt-3 flex items-center justify-center">
                <span className="text-[10px] font-medium text-text-muted px-2.5 py-0.5 rounded-full bg-surface-border/50 border border-surface-border">
                  Sample interview
                </span>
              </div>
            </div>

            {/* Floating badge - top right */}
            <motion.div
              animate={{ y: [0, -6, 0], rotate: [0, 2, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -top-3 -right-2 sm:-top-4 sm:-right-4 glass-card px-2.5 sm:px-3 py-1.5 sm:py-2 flex items-center gap-2"
            >
              <Sparkles className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-brand-indigo" />
              <span className="text-[11px] sm:text-xs font-semibold text-text-primary">Instant Feedback</span>
            </motion.div>

            {/* Floating badge - bottom left */}
            <motion.div
              animate={{ y: [0, 6, 0], rotate: [0, -2, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute -bottom-3 -left-2 sm:-bottom-4 sm:-left-4 glass-card px-2.5 sm:px-3 py-1.5 sm:py-2 flex items-center gap-2"
            >
              <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-green-400" />
              <span className="text-[11px] sm:text-xs font-semibold text-text-primary">AI Ready</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <p className="text-text-muted text-xs tracking-widest uppercase">Scroll to explore</p>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-5 h-8 rounded-full border border-surface-border2 flex items-start justify-center pt-1.5"
        >
          <div className="w-1 h-2 rounded-full bg-brand-indigo" />
        </motion.div>
      </motion.div>
    </section>
  )
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────
function StatsBar() {
  const stats = [
    { icon: Target, label: 'Interview Domains', value: '10+' },
    { icon: Mic, label: 'Response Modes', value: 'Voice + Text' },
    { icon: Zap, label: 'Evaluation Speed', value: 'Instant' },
    { icon: Sparkles, label: 'Practice Access', value: '100% Free' },
  ]

  return (
    <section className="py-12 border-y border-surface-border">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8"
        >
          {stats.map((s) => (
            <motion.div key={s.label} variants={fadeUp} className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <s.icon className="w-5 h-5 text-brand-indigo" />
              </div>
              <p className="text-2xl sm:text-3xl font-black gradient-text-brand">{s.value}</p>
              <p className="text-text-muted text-xs">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── Features Section ─────────────────────────────────────────────────────────
const features = [
  {
    icon: Mic,
    title: 'Voice-Powered Input',
    description: 'Speak your answers naturally. Real-time speech-to-text transcription with filler word detection and pacing analysis.',
    color: '#6366F1',
    tag: 'Web Speech API',
  },
  {
    icon: Brain,
    title: 'Gemini AI Evaluation',
    description: 'Each answer is scored on accuracy, depth, clarity, and relevance using Google Gemini — just like a real interviewer.',
    color: '#8B5CF6',
    tag: 'Google Gemini',
  },
  {
    icon: FileText,
    title: 'Resume-Based Questions',
    description: 'Upload your resume and get personalized questions tailored to your experience, skills, and target role.',
    color: '#EC4899',
    tag: 'PDF Parsing',
  },
  {
    icon: BarChart3,
    title: 'Detailed Report Card',
    description: 'Post-interview breakdown with per-question scores, radar chart, confidence rating, and ideal answer suggestions.',
    color: '#F59E0B',
    tag: 'Analytics',
  },
  {
    icon: Target,
    title: 'Domain-Specific Prep',
    description: 'Choose from DSA, Web Dev, OS, DBMS, System Design and more. Technical or HR — we cover every interview type.',
    color: '#10B981',
    tag: 'Multi-Domain',
  },
  {
    icon: Trophy,
    title: 'Streak & Progress',
    description: 'Daily streaks, improvement tracking, and shareable performance cards to showcase your prep journey to recruiters.',
    color: '#06B6D4',
    tag: 'Gamification',
  },
]

function Features() {
  return (
    <section id="features" className="py-28 relative">
      <div className="max-w-6xl mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <span className="section-label mb-5 inline-flex">
            <Zap className="w-3 h-3" /> Features
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-text-primary mb-4 tracking-tight">
            Everything you need to{' '}
            <span className="gradient-text-brand">nail the interview</span>
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            A complete interview preparation platform — from your first practice session to the final offer letter.
          </p>
        </AnimatedSection>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((f, i) => (
            <motion.div key={f.title} variants={fadeUp} className="feature-card group">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                style={{ background: `${f.color}15`, border: `1px solid ${f.color}30` }}
              >
                <f.icon className="w-5 h-5" style={{ color: f.color }} />
              </div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="text-base font-semibold text-text-primary leading-snug">{f.title}</h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5"
                  style={{ color: f.color, background: `${f.color}15` }}>
                  {f.tag}
                </span>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">{f.description}</p>
              <div className="mt-5 flex items-center gap-1.5 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: f.color }}>
                Learn more <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── How It Works ─────────────────────────────────────────────────────────────
const steps = [
  {
    number: '01',
    icon: Target,
    title: 'Set your goal',
    description: 'Choose your target role, experience level, interview type (Technical / HR / Mixed), difficulty, and domain.',
    detail: 'DSA · Web Dev · OS · DBMS · System Design · HR',
  },
  {
    number: '02',
    icon: Mic,
    title: 'Speak your answers',
    description: 'AI asks dynamic, context-aware questions. You answer with voice — real-time transcription shows your words as you speak.',
    detail: 'Speech-to-text · Filler word detection · Pacing',
  },
  {
    number: '03',
    icon: BarChart3,
    title: 'Get your report',
    description: 'Receive a detailed post-interview report with scores, confidence analysis, ideal answers, and a personalized improvement plan.',
    detail: 'Score · Radar chart · Ideal answers · Progress',
  },
]

function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 relative" style={{ background: 'linear-gradient(180deg, transparent, rgba(99,102,241,0.04) 50%, transparent)' }}>
      <div className="max-w-6xl mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <span className="section-label mb-5 inline-flex">
            <Cpu className="w-3 h-3" /> How It Works
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-text-primary mb-4 tracking-tight">
            From zero to{' '}
            <span className="gradient-text-brand">interview-ready</span>
            <br />in 3 steps
          </h2>
          <p className="text-text-secondary text-lg max-w-xl mx-auto">
            No setup headaches. Start practicing in under 60 seconds.
          </p>
        </AnimatedSection>

        <div className="relative">
          {/* Connecting line */}
          <div className="hidden lg:block absolute top-14 left-[16.66%] right-[16.66%] h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.4) 20%, rgba(139,92,246,0.4) 80%, transparent)' }} />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {steps.map((step, i) => (
              <motion.div key={step.number} variants={fadeUp} className="relative flex flex-col items-center lg:items-start text-center lg:text-left">
                {/* Step number circle */}
                <div className="relative mb-6">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center relative z-10"
                    style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 0 30px rgba(99,102,241,0.4)' }}>
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-bg-primary border border-brand-indigo flex items-center justify-center">
                    <span className="text-[10px] font-black text-brand-indigo">{i + 1}</span>
                  </div>
                </div>

                <span className="text-[10px] font-black tracking-widest text-brand-indigo mb-2 uppercase">{step.number}</span>
                <h3 className="text-xl font-bold text-text-primary mb-3">{step.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed mb-4">{step.description}</p>
                <div className="flex flex-wrap gap-1.5 justify-center lg:justify-start">
                  {step.detail.split(' · ').map((tag) => (
                    <span key={tag} className="text-[10px] px-2 py-1 rounded-md font-medium"
                      style={{ color: '#94A3B8', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ─── Why InterviewSense ───────────────────────────────────────────────────────
const whyFeatures = [
  {
    icon: Target,
    title: 'Tailored to Job Descriptions & Resumes',
    description: 'Paste any target job description or upload your resume. Gemini extracts required tech stacks and responsibilities to generate realistic role-specific questions.',
    tag: 'Targeted Questions',
    color: '#6366F1',
  },
  {
    icon: Zap,
    title: 'Instant Feedback & Scoring',
    description: 'Get immediate scoring across technical accuracy, depth, and clarity after every answer, along with model answers and actionable improvement guidance.',
    tag: 'Live Evaluation',
    color: '#8B5CF6',
  },
  {
    icon: BarChart3,
    title: 'Progress Tracking Across Sessions',
    description: 'Track your growth across every mock interview with radar charts, performance category breakdowns, and complete session history on your dashboard.',
    tag: 'Detailed Analytics',
    color: '#EC4899',
  },
]

function WhyInterviewSense() {
  return (
    <section id="why-interviewsense" className="py-28">
      <div className="max-w-6xl mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <span className="section-label mb-5 inline-flex">
            <Sparkles className="w-3 h-3" /> Why InterviewSense
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-text-primary mb-4 tracking-tight">
            Real practice for{' '}
            <span className="gradient-text-brand">real interviews.</span>
          </h2>
          <p className="text-text-secondary text-base sm:text-lg max-w-xl mx-auto">
            Everything in InterviewSense is built around realistic preparation, objective feedback, and measurable improvement.
          </p>
        </AnimatedSection>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {whyFeatures.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              className="glass-card p-6 sm:p-7 flex flex-col justify-between hover:border-surface-border2 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: `${f.color}15`, border: `1px solid ${f.color}30` }}
                  >
                    <f.icon className="w-5 h-5" style={{ color: f.color }} />
                  </div>
                  <span
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
                    style={{ color: f.color, background: `${f.color}15` }}
                  >
                    {f.tag}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2.5 leading-snug">
                  {f.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {f.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────
function CTABanner() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-5xl mx-auto">
        <AnimatedSection>
          <div className="relative overflow-hidden rounded-3xl p-12 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.2) 100%)',
              border: '1px solid rgba(99,102,241,0.3)',
            }}>
            {/* BG orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-1/4 w-64 h-64 rounded-full opacity-30"
                style={{ background: 'radial-gradient(circle, #6366F1 0%, transparent 70%)' }} />
              <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full opacity-20"
                style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)' }} />
            </div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 mb-6" style={{ color: '#8B5CF6' }}>
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-semibold">100% Free to start</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-text-primary mb-4 tracking-tight">
                Your next interview
                <br />
                <span className="gradient-text-brand">starts right now.</span>
              </h2>
              <p className="text-text-secondary text-base sm:text-lg mb-10 max-w-xl mx-auto">
                No credit card. No signup friction. Just you, AI, and the preparation that lands offers.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup" id="cta-banner-primary" className="btn-primary w-full sm:w-auto px-6 sm:px-10 py-3.5 sm:py-4 text-base justify-center">
                  Start Your First Interview Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="flex items-center justify-center gap-4 sm:gap-8 mt-10 flex-wrap">
                {[
                  { icon: CheckCircle, text: 'No credit card required' },
                  { icon: Shield, text: 'Private & secure' },
                  { icon: Clock, text: 'Ready in 60 seconds' },
                ].map((item) => (
                  <div key={item.text} className="flex items-center gap-2 text-text-secondary text-sm">
                    <item.icon className="w-4 h-4 text-green-400" />
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <footer className="border-t border-surface-border py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-text-primary">
                InterviewSense
              </span>
            </div>
            <p className="text-text-secondary text-sm leading-relaxed max-w-xs mb-5">
              AI-powered mock interviews that prepare you for the real thing. Practice smarter. Perform better.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Twitter, label: 'Twitter', href: '#' },
                { icon: Github, label: 'GitHub', href: '#' },
                { icon: Linkedin, label: 'LinkedIn', href: '#' },
              ].map((s) => (
                <a key={s.label} href={s.href} aria-label={s.label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-text-muted hover:text-text-primary hover:border-brand-indigo transition-all"
                  style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}>
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Product links */}
          <div>
            <p className="text-text-primary text-sm font-semibold mb-4">Product</p>
            <ul className="space-y-3">
              {[
                { label: 'Features', action: () => scrollTo('features') },
                { label: 'How it works', action: () => scrollTo('how-it-works') },
                { label: 'Why InterviewSense', action: () => scrollTo('why-interviewsense') },
                { label: 'Dashboard', href: '/dashboard' },
              ].map((item) => (
                <li key={item.label}>
                  {item.href ? (
                    <Link to={item.href} className="text-text-muted hover:text-text-primary text-sm transition-colors">{item.label}</Link>
                  ) : (
                    <button onClick={item.action} className="text-text-muted hover:text-text-primary text-sm transition-colors text-left">{item.label}</button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-text-primary text-sm font-semibold mb-4">Legal</p>
            <ul className="space-y-3">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-text-muted hover:text-text-primary text-sm transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-surface-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-xs">
            © 2024 InterviewSense. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-text-muted text-xs">
            <span>Built with</span>
            <Globe className="w-3.5 h-3.5 text-brand-indigo" />
            <span>React · Flask · Google Gemini · Firebase</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// ─── Demo Question Modal (No Signup Required) ────────────────────────────────
function DemoQuestionModal({ isOpen, onClose }) {
  const [role, setRole] = useState('Software Engineer')
  const [question, setQuestion] = useState('')
  const [loadingQuestion, setLoadingQuestion] = useState(false)
  const [answer, setAnswer] = useState('')
  const [evaluating, setEvaluating] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const roles = [
    { id: 'Software Engineer', label: 'Software Engineer', icon: Cpu },
    { id: 'Data/ML', label: 'Data / ML', icon: Brain },
    { id: 'HR/Behavioral', label: 'HR / Behavioral', icon: Target },
  ]

  const fetchQuestion = async (targetRole) => {
    setLoadingQuestion(true)
    setError(null)
    setResult(null)
    setAnswer('')
    try {
      const res = await axios.post(`${API_BASE}/api/demo/question`, { role: targetRole })
      if (res.data?.question) {
        setQuestion(res.data.question)
      } else {
        throw new Error('Could not load question.')
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Unable to generate demo question. Please try again.'
      setError(msg)
    } finally {
      setLoadingQuestion(false)
    }
  }

  // Load question when modal opens if empty
  useEffect(() => {
    if (isOpen && !question && !loadingQuestion) {
      fetchQuestion(role)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleRoleChange = (newRole) => {
    if (newRole === role && question) return
    setRole(newRole)
    fetchQuestion(newRole)
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!answer.trim() || evaluating) return
    setEvaluating(true)
    setError(null)
    try {
      const res = await axios.post(`${API_BASE}/api/demo/evaluate`, {
        role,
        question,
        answer: answer.trim().slice(0, 600),
      })
      if (res.data && typeof res.data.score === 'number') {
        setResult(res.data)
      } else {
        throw new Error('Invalid evaluation format.')
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Evaluation is temporarily unavailable. Please try again or sign up for full interviews.'
      setError(msg)
    } finally {
      setEvaluating(false)
    }
  }

  const handleResetForNewQuestion = () => {
    fetchQuestion(role)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="glass-card w-full max-w-xl rounded-2xl p-4 sm:p-7 relative border border-surface-border shadow-2xl space-y-5 my-auto max-h-[92vh] overflow-y-auto"
        style={{
          background: 'var(--card-bg)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px var(--card-border)',
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close demo"
          className="absolute top-3.5 right-3.5 p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1.5 pr-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-indigo/15 text-brand-indigo border border-brand-indigo/30">
            <Sparkles className="w-3 h-3" />
            <span>Instant Demo · No sign-up required</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-text-primary font-heading tracking-tight">
            Try an AI Mock Interview Question
          </h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            Pick a role, answer the question below in text mode, and get instant feedback and scoring powered by Gemini.
          </p>
        </div>

        {/* Role Selector */}
        <div>
          <label className="text-xs font-semibold text-text-primary block mb-2">
            Select Role Track:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {roles.map((r) => {
              const isSelected = role === r.id
              return (
                <button
                  key={r.id}
                  type="button"
                  disabled={loadingQuestion || evaluating}
                  onClick={() => handleRoleChange(r.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-brand-indigo/20 text-brand-indigo border border-brand-indigo/50 shadow-sm'
                      : 'bg-surface/60 text-text-secondary border border-surface-border hover:border-surface-border/80 hover:text-text-primary'
                  }`}
                >
                  <r.icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{r.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Question Display */}
        {loadingQuestion ? (
          <div className="p-4 rounded-xl bg-surface/50 border border-surface-border flex items-center gap-3 text-xs text-text-muted">
            <Loader2 className="w-4 h-4 animate-spin text-brand-indigo flex-shrink-0" />
            <span>Generating tailored {role} question with Gemini…</span>
          </div>
        ) : question ? (
          <div className="p-4 rounded-xl bg-surface/70 border border-surface-border relative">
            <div className="flex items-start justify-between gap-3 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-indigo">
                {role} Question
              </span>
              <button
                type="button"
                onClick={handleResetForNewQuestion}
                disabled={loadingQuestion || evaluating}
                className="text-[11px] text-text-muted hover:text-brand-indigo flex items-center gap-1 cursor-pointer transition-colors"
                title="Get a different question"
              >
                <RefreshCw className="w-3 h-3" />
                <span>New Question</span>
              </button>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-text-primary leading-relaxed">
              {question}
            </p>
          </div>
        ) : null}

        {/* Answer Form & Submission (Shown when no result yet) */}
        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-3 pt-1">
            <div>
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <label className="font-semibold text-text-primary">
                  Your Answer <span className="text-text-muted font-normal text-[11px]">(text mode demo)</span>
                </label>
                <span
                  className={`text-[11px] font-mono font-semibold ${
                    answer.length >= 580
                      ? 'text-rose-400'
                      : answer.length >= 500
                      ? 'text-amber-400'
                      : 'text-text-muted'
                  }`}
                >
                  {answer.length}/600
                </span>
              </div>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value.slice(0, 600))}
                maxLength={600}
                rows={4}
                disabled={evaluating || loadingQuestion}
                placeholder="Type your response here (key concepts, practical explanation, trade-offs)..."
                className="input-field w-full text-xs sm:text-sm p-3 resize-none leading-relaxed"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5 text-xs text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{error}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              <span className="text-[11px] text-text-muted">
                No voice mode or login in demo.
              </span>
              <button
                type="submit"
                disabled={!answer.trim() || evaluating || loadingQuestion}
                className="btn-primary py-2.5 px-5 text-xs sm:text-sm font-bold justify-center disabled:opacity-50 cursor-pointer"
              >
                {evaluating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                    <span>Evaluating answer…</span>
                  </>
                ) : (
                  <>
                    <span>Submit Answer</span>
                    <Send className="w-3.5 h-3.5 ml-1.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* Result View */
          <div className="space-y-4 pt-1">
            {/* Header label and Score */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface/80 border border-surface-border">
              <div className="space-y-0.5">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-indigo/15 text-brand-indigo border border-brand-indigo/30 inline-block">
                  Demo evaluation
                </span>
                <p className="text-[11px] text-text-muted mt-1">{role} track</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-3xl font-black font-heading ${
                    result.score >= 75
                      ? 'text-emerald-400'
                      : result.score >= 50
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {result.score}
                </span>
                <span className="text-xs text-text-muted font-bold">/100</span>
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 2 Strengths */}
              <div className="p-3.5 rounded-xl bg-surface/70 border border-surface-border space-y-2">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Strengths
                </span>
                <ul className="space-y-1.5 text-xs text-text-secondary">
                  {result.strengths?.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 2 Improvements */}
              <div className="p-3.5 rounded-xl bg-surface/70 border border-surface-border space-y-2">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Improvements
                </span>
                <ul className="space-y-1.5 text-xs text-text-secondary">
                  {result.improvements?.map((imp, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" />
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Short Ideal Answer Outline */}
            {result.idealAnswer && (
              <div className="p-3.5 rounded-xl bg-surface/60 border border-surface-border space-y-1.5">
                <span className="text-[11px] font-bold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-brand-indigo" />
                  Ideal Answer Outline
                </span>
                <p className="text-xs text-text-secondary leading-relaxed">
                  {result.idealAnswer}
                </p>
              </div>
            )}

            {/* CTA to Login/Sign up for full interview */}
            <div className="pt-2 space-y-2.5">
              <Link
                to="/login"
                className="btn-primary w-full py-3.5 px-4 text-xs sm:text-sm font-bold text-center justify-center shadow-lg shadow-indigo-500/20"
              >
                <span>Sign up to take the full interview with voice, follow-ups and a study plan</span>
                <ArrowRight className="w-4 h-4 ml-1.5 flex-shrink-0" />
              </Link>

              <button
                type="button"
                onClick={handleResetForNewQuestion}
                className="w-full py-2 text-xs text-text-muted hover:text-text-primary transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Try another demo question</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function Landing() {
  const [showDemoModal, setShowDemoModal] = useState(false)

  useEffect(() => {
    // Silently ping /health so Render's free-tier instance wakes up early before user starts an interview
    const pingHealth = async () => {
      try {
        await fetch(`${API_BASE}/health`, { method: 'GET', mode: 'cors' })
      } catch {
        try {
          await fetch(`${API_BASE}/api/health`, { method: 'GET', mode: 'cors' })
        } catch {
          // Silently ignore ping errors on landing page
        }
      }
    }
    pingHealth()
  }, [])

  return (
    <div className="bg-bg-primary min-h-screen">
      <Navbar />
      <Hero onOpenDemo={() => setShowDemoModal(true)} />
      <StatsBar />
      <Features />
      <HowItWorks />
      <WhyInterviewSense />
      <CTABanner />
      <Footer />
      <DemoQuestionModal
        isOpen={showDemoModal}
        onClose={() => setShowDemoModal(false)}
      />
    </div>
  )
}
