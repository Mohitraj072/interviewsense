import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, Sparkles, Check, CheckCircle2, ChevronRight } from 'lucide-react'
import { COMPANIES } from '../constants/companies'
import CompanyLogo from './CompanyLogo'

export default function CompanyModeSection({
  isCompanyMode = false,
  setIsCompanyMode,
  selectedCompany = 'Google',
  setSelectedCompany,
}) {
  const currentCompany = COMPANIES.find((c) => c.id === selectedCompany) || COMPANIES[0]

  return (
    <div
      className="p-6 rounded-2xl transition-all duration-300 relative overflow-hidden"
      style={{
        background: isCompanyMode
          ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.04) 100%)'
          : 'var(--card-bg)',
        border: isCompanyMode
          ? '1.5px solid rgba(99, 102, 241, 0.35)'
          : '1px solid var(--card-border)',
        boxShadow: isCompanyMode
          ? '0 0 30px rgba(99, 102, 241, 0.12)'
          : 'var(--card-shadow)',
      }}
    >
      {/* Section Header & Toggle Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300"
            style={{
              background: isCompanyMode
                ? 'linear-gradient(135deg, #6366F1, #8B5CF6)'
                : 'rgba(255, 255, 255, 0.05)',
              color: isCompanyMode ? '#ffffff' : 'var(--text-secondary)',
              boxShadow: isCompanyMode ? '0 0 18px rgba(99, 102, 241, 0.4)' : 'none',
            }}
          >
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-text-primary tracking-tight">
                Company Mode
              </span>
              {isCompanyMode ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/35">
                  <Sparkles className="w-3 h-3 text-indigo-400" />
                  Active: {currentCompany.name}
                </span>
              ) : (
                <span className="text-[11px] font-medium text-text-muted px-2 py-0.5 rounded-full bg-white/5 border border-white/5">
                  Optional
                </span>
              )}
            </div>
            <p className="text-xs text-text-muted mt-0.5">
              Simulate company-specific interview loops, hiring bars, and question styles
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <span className="text-xs font-semibold text-text-muted">
            {isCompanyMode ? 'Enabled' : 'Disabled'}
          </span>
          <button
            type="button"
            id="toggle-company-mode"
            role="switch"
            aria-checked={isCompanyMode}
            onClick={() => {
              const nextState = !isCompanyMode
              setIsCompanyMode(nextState)
              if (nextState && !selectedCompany) {
                setSelectedCompany('Google')
              }
            }}
            className="relative inline-flex h-7 w-13 flex-shrink-0 cursor-pointer rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
            style={{
              background: isCompanyMode
                ? 'linear-gradient(135deg, #6366F1, #8B5CF6)'
                : 'var(--surface-border2, #2A2A3E)',
              boxShadow: isCompanyMode ? '0 0 14px rgba(99, 102, 241, 0.5)' : 'none',
            }}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out ${
                isCompanyMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Grid of Company Cards (shown when Company Mode is enabled) */}
      <AnimatePresence>
        {isCompanyMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pt-6 border-t border-surface-border/60 mt-5">
              <div className="flex items-center justify-between mb-3.5">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                  Select Target Company
                </label>
                <span className="text-[11px] text-text-muted">
                  Questions calibrate strictly to company interview style
                </span>
              </div>

              {/* Grid of 6 Companies */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {COMPANIES.map((company) => {
                  const active = selectedCompany === company.id

                  return (
                    <motion.button
                      key={company.id}
                      type="button"
                      id={`company-card-${company.id.toLowerCase()}`}
                      onClick={() => setSelectedCompany(company.id)}
                      whileHover={{ y: -3, scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      transition={{ duration: 0.2 }}
                      className="p-4 rounded-xl text-left transition-all duration-200 cursor-pointer relative flex flex-col justify-between group overflow-hidden"
                      style={{
                        background: active
                          ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.16) 0%, rgba(139, 92, 246, 0.08) 100%)'
                          : 'var(--pill-bg)',
                        border: active
                          ? '1.5px solid #6366F1'
                          : '1px solid var(--surface-border)',
                        boxShadow: active
                          ? '0 0 24px rgba(99, 102, 241, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                          : 'var(--card-shadow)',
                      }}
                    >
                      {/* Active indicator badge */}
                      {active && (
                        <div className="absolute top-3 right-3 flex items-center justify-center w-5 h-5 rounded-full bg-[#6366F1] text-white shadow-sm shadow-indigo-500/50">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}

                      <div>
                        {/* Company Logo Icon + Name */}
                        <div className="flex items-center gap-3 mb-2.5 pr-6">
                          <CompanyLogo companyId={company.id} size="md" />
                          <div>
                            <h3 className="font-bold text-sm text-text-primary group-hover:text-white transition-colors flex items-center gap-1.5">
                              {company.name}
                            </h3>
                            <span className="text-[10px] text-text-muted line-clamp-1">
                              {company.tagline}
                            </span>
                          </div>
                        </div>

                        {/* 3 Focus Areas as small tags */}
                        <div className="pt-2">
                          <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                            Focus Areas
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {company.focus.map((tag) => (
                              <span
                                key={tag}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-colors ${
                                  active
                                    ? 'bg-indigo-500/25 text-indigo-200 border border-indigo-500/35 font-semibold'
                                    : 'bg-white/5 text-text-secondary border border-surface-border group-hover:border-surface-border2'
                                }`}
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Active footer prompt */}
                      {active && (
                        <div className="mt-3 pt-2.5 border-t border-indigo-500/20 flex items-center justify-between text-[11px] text-indigo-300 font-medium">
                          <span>Target hiring bar active</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </motion.button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
