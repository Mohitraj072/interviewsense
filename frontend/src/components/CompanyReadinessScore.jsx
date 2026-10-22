import React from 'react'
import { motion } from 'framer-motion'
import { Building2, Sparkles, Target, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react'
import CompanyLogo from './CompanyLogo'
import { calculateCompanyReadiness, getCompanyById } from '../constants/companies'

export default function CompanyReadinessScore({
  companyId = 'Google',
  overallScore = 80,
  answeredCount = 5,
  className = '',
}) {
  const readiness = calculateCompanyReadiness(companyId, overallScore, answeredCount)
  const company = readiness.company

  const radius = 32
  const circumference = 2 * Math.PI * radius
  const percentage = readiness.percentage ?? 0
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className={`glass-card p-6 rounded-2xl relative overflow-hidden ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.06) 50%, rgba(17, 17, 24, 0.85) 100%)',
        border: '1.5px solid rgba(99, 102, 241, 0.35)',
        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Background glow decoration */}
      <div
        className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-30"
        style={{ background: company.accentColor || '#6366F1' }}
      />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
        {/* Left: Company Identity & Status */}
        <div className="flex items-start gap-4 flex-1">
          <CompanyLogo companyId={company.id} size="lg" className="mt-1 shadow-lg" />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-indigo/15 text-indigo-300 border border-brand-indigo/30">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                Company Readiness Score
              </span>
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${readiness.badgeColor}`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {readiness.badgeText}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-text-primary tracking-tight font-heading">
              {company.name} Interview Readiness:{' '}
              <span className="gradient-text-brand">{readiness.score !== null ? `${readiness.score}%` : 'Pending'}</span>
            </h2>

            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-2xl">
              {readiness.summary}
            </p>

            {/* Target Company Focus Areas */}
            <div className="pt-2 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold text-text-muted flex items-center gap-1">
                <Target className="w-3 h-3 text-indigo-400" /> Key Focus:
              </span>
              {company.focus.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-lg text-[11px] font-medium bg-white/5 border border-white/10 text-indigo-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Circular Readiness Meter */}
        <div className="flex items-center gap-4 self-center lg:self-auto flex-shrink-0 bg-surface/60 border border-surface-border p-3.5 rounded-2xl backdrop-blur-md">
          <div className="relative flex items-center justify-center">
            <svg className="w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r={radius}
                stroke="var(--surface-border)"
                strokeWidth="6"
                fill="transparent"
              />
              <motion.circle
                cx="40"
                cy="40"
                r={radius}
                stroke={readiness.tier === 'high' ? '#10B981' : readiness.tier === 'competitive' ? '#6366F1' : readiness.tier === 'moderate' ? '#F59E0B' : '#EF4444'}
                strokeWidth="6"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-base font-extrabold text-text-primary font-heading">
                {readiness.score !== null ? `${readiness.score}%` : '—'}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-text-muted font-bold">
                Fit
              </span>
            </div>
          </div>

          <div className="text-left pr-2">
            <div className="text-xs font-bold text-text-primary">
              {readiness.verdictText || 'Readiness Level'}
            </div>
            <div className="text-[11px] text-text-muted mt-0.5 max-w-[140px] leading-tight">
              Calibrated to {company.name}'s bar
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Recommendation Footer */}
      {readiness.recommendation && (
        <div className="mt-4 pt-3.5 border-t border-surface-border/60 flex items-start gap-2.5 text-xs text-text-secondary">
          <div className="w-5 h-5 rounded-md bg-indigo-500/15 text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-semibold text-text-primary">Preparation Tip for {company.name}: </span>
            <span>{readiness.recommendation}</span>
          </div>
        </div>
      )}
    </motion.div>
  )
}
