import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useInView, useScroll, useTransform } from 'framer-motion'
import {
  Mic, Brain, FileText, BarChart3, Star, Shield, Zap, ArrowRight,
  ChevronRight, Play, CheckCircle, Users, Trophy, TrendingUp,
  MessageSquare, Cpu, Target, Github, Twitter, Linkedin,
  Sparkles, Clock, Award, Globe
} from 'lucide-react'
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
            InterviewSense<span className="gradient-text-brand"> AI</span>
          </span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {['features', 'how-it-works', 'testimonials'].map((id) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors capitalize"
            >
              {id.replace('-', ' ')}
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
          {['features', 'how-it-works', 'testimonials'].map((id) => (
            <button key={id} onClick={() => scrollTo(id)} className="text-text-secondary text-sm text-left capitalize hover:text-text-primary">
              {id.replace('-', ' ')}
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
function Hero() {
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
            Powered by Gemini 1.5 Pro
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6"
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
            <Link to="/signup" id="hero-cta-primary" className="btn-primary px-8 py-4 text-base">
              Start Free Interview
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              id="hero-watch-demo"
              className="btn-secondary px-8 py-4 text-base flex items-center gap-3"
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
                <Play className="w-3 h-3 text-brand-indigo fill-brand-indigo" />
              </div>
              Watch Demo
            </button>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="flex items-center gap-6 mt-10 justify-center lg:justify-start flex-wrap"
          >
            <div className="flex -space-x-2">
              {['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'].map((color, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-bg-primary flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: color }}
                >
                  {['R', 'S', 'M', 'A', 'K'][i]}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-text-primary font-semibold text-sm ml-1">4.9</span>
              </div>
              <p className="text-text-muted text-xs">Trusted by 12,000+ job seekers</p>
            </div>
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
            </div>

            {/* Floating badge - top right */}
            <motion.div
              animate={{ y: [0, -6, 0], rotate: [0, 2, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="absolute -top-4 -right-4 glass-card px-3 py-2 flex items-center gap-2"
            >
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-semibold text-text-primary">Top 5%</span>
            </motion.div>

            {/* Floating badge - bottom left */}
            <motion.div
              animate={{ y: [0, 6, 0], rotate: [0, -2, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              className="absolute -bottom-4 -left-4 glass-card px-3 py-2 flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-xs font-semibold text-text-primary">AI Ready</span>
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
    { icon: Users, label: 'Active Users', value: '12,000+' },
    { icon: MessageSquare, label: 'Interviews Done', value: '84,000+' },
    { icon: TrendingUp, label: 'Avg Score Boost', value: '+34%' },
    { icon: Award, label: 'Offer Rate', value: '89%' },
  ]

  return (
    <section className="py-12 border-y border-surface-border">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          variants={stagger}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((s) => (
            <motion.div key={s.label} variants={fadeUp} className="flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-1" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <s.icon className="w-5 h-5 text-brand-indigo" />
              </div>
              <p className="text-3xl font-black gradient-text-brand">{s.value}</p>
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
    description: 'Each answer is scored on accuracy, depth, clarity, and relevance using Gemini 1.5 Pro — just like a real interviewer.',
    color: '#8B5CF6',
    tag: 'Gemini 1.5 Pro',
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

// ─── Testimonials ─────────────────────────────────────────────────────────────
const testimonials = [
  {
    quote: "InterviewSense AI completely transformed my prep. After 2 weeks of daily practice, I nailed my Google interview. The AI feedback was brutally honest and incredibly helpful.",
    name: "Rahul Sharma",
    role: "SDE-2 @ Google",
    avatar: "RS",
    color: "#6366F1",
    stars: 5,
  },
  {
    quote: "The resume-based questions blew me away. It pulled out the exact projects from my resume and asked deep follow-up questions. Felt like talking to a senior engineer.",
    name: "Shreya Mehta",
    role: "Frontend Engineer @ Stripe",
    avatar: "SM",
    color: "#8B5CF6",
    stars: 5,
  },
  {
    quote: "I was nervous about voice interviews, but the filler word counter and confidence rating really helped me improve my communication. Landed my dream job in 3 weeks!",
    name: "Karan Patel",
    role: "Product Manager @ Atlassian",
    avatar: "KP",
    color: "#EC4899",
    stars: 5,
  },
]

function Testimonials() {
  return (
    <section id="testimonials" className="py-28">
      <div className="max-w-6xl mx-auto px-6">
        <AnimatedSection className="text-center mb-16">
          <span className="section-label mb-5 inline-flex">
            <Star className="w-3 h-3" /> Testimonials
          </span>
          <h2 className="text-4xl sm:text-5xl font-black text-text-primary mb-4 tracking-tight">
            Real people.{' '}
            <span className="gradient-text-brand">Real offers.</span>
          </h2>
          <p className="text-text-secondary text-lg max-w-xl mx-auto">
            Join thousands of developers and PMs who used InterviewSense AI to land their dream roles.
          </p>
        </AnimatedSection>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {testimonials.map((t, i) => (
            <motion.div key={t.name} variants={fadeUp} className="glass-card p-6 flex flex-col gap-5 hover:border-surface-border2 transition-all duration-300">
              {/* Stars */}
              <div className="flex gap-1">
                {[...Array(t.stars)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-text-secondary text-sm leading-relaxed flex-1">
                "{t.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-3 border-t border-surface-border">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: t.color }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{t.name}</p>
                  <p className="text-xs text-text-muted">{t.role}</p>
                </div>
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
              <h2 className="text-4xl sm:text-5xl font-black text-text-primary mb-4 tracking-tight">
                Your next interview
                <br />
                <span className="gradient-text-brand">starts right now.</span>
              </h2>
              <p className="text-text-secondary text-lg mb-10 max-w-xl mx-auto">
                No credit card. No signup friction. Just you, AI, and the preparation that lands offers.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/signup" id="cta-banner-primary" className="btn-primary px-10 py-4 text-base">
                  Start Your First Interview Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="flex items-center justify-center gap-8 mt-10 flex-wrap">
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
                InterviewSense<span className="gradient-text-brand"> AI</span>
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
                { label: 'Testimonials', action: () => scrollTo('testimonials') },
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
            © 2024 InterviewSense AI. All rights reserved.
          </p>
          <div className="flex items-center gap-1.5 text-text-muted text-xs">
            <span>Built with</span>
            <Globe className="w-3.5 h-3.5 text-brand-indigo" />
            <span>React · Flask · Gemini 1.5 Pro · Firebase</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function Landing() {
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
      <Hero />
      <StatsBar />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTABanner />
      <Footer />
    </div>
  )
}
