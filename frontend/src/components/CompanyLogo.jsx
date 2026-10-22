import React from 'react'

/**
 * CompanyLogo Component
 * Renders styled letter avatar and iconic brand graphics for target companies.
 */
export default function CompanyLogo({ companyId = 'Google', size = 'md', className = '' }) {
  const comp = String(companyId || '').toLowerCase().trim()

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-14 h-14 text-lg',
  }[size] || 'w-10 h-10 text-sm'

  switch (comp) {
    case 'google':
      return (
        <div
          className={`${sizeClasses} rounded-xl flex items-center justify-center font-black relative overflow-hidden flex-shrink-0 shadow-md ${className}`}
          style={{
            background: 'linear-gradient(135deg, rgba(66, 133, 244, 0.15) 0%, rgba(52, 168, 83, 0.15) 100%)',
            border: '1.5px solid rgba(66, 133, 244, 0.4)',
          }}
          title="Google"
        >
          {/* Stylized Google Multi-color G */}
          <span className="font-extrabold tracking-tight select-none flex items-center">
            <span style={{ color: '#4285F4' }}>G</span>
            <span style={{ color: '#EA4335' }}>o</span>
            <span style={{ color: '#FBBC05' }}>o</span>
          </span>
        </div>
      )

    case 'amazon':
      return (
        <div
          className={`${sizeClasses} rounded-xl flex items-center justify-center font-black relative overflow-hidden flex-shrink-0 shadow-md ${className}`}
          style={{
            background: 'linear-gradient(135deg, rgba(255, 153, 0, 0.18) 0%, rgba(19, 25, 33, 0.6) 100%)',
            border: '1.5px solid rgba(255, 153, 0, 0.45)',
          }}
          title="Amazon"
        >
          <div className="relative flex flex-col items-center">
            <span className="text-amber-400 font-extrabold tracking-tight select-none">a</span>
            {/* Curved smile underline */}
            <svg
              className="w-4 h-1.5 -mt-0.5 text-amber-400"
              viewBox="0 0 24 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            >
              <path d="M2 3 Q 12 12, 22 3" />
            </svg>
          </div>
        </div>
      )

    case 'microsoft':
      return (
        <div
          className={`${sizeClasses} rounded-xl flex items-center justify-center relative overflow-hidden flex-shrink-0 shadow-md ${className}`}
          style={{
            background: 'linear-gradient(135deg, rgba(0, 164, 239, 0.15) 0%, rgba(127, 186, 0, 0.15) 100%)',
            border: '1.5px solid rgba(0, 164, 239, 0.4)',
          }}
          title="Microsoft"
        >
          {/* 4 Windows squares */}
          <div className="grid grid-cols-2 gap-1 p-1">
            <div className="w-2 h-2 rounded-[2px]" style={{ background: '#F25022' }} />
            <div className="w-2 h-2 rounded-[2px]" style={{ background: '#7FBA00' }} />
            <div className="w-2 h-2 rounded-[2px]" style={{ background: '#00A4EF' }} />
            <div className="w-2 h-2 rounded-[2px]" style={{ background: '#FFB900' }} />
          </div>
        </div>
      )

    case 'meta':
      return (
        <div
          className={`${sizeClasses} rounded-xl flex items-center justify-center font-black relative overflow-hidden flex-shrink-0 shadow-md ${className}`}
          style={{
            background: 'linear-gradient(135deg, rgba(6, 104, 225, 0.2) 0%, rgba(147, 51, 234, 0.2) 100%)',
            border: '1.5px solid rgba(6, 104, 225, 0.45)',
          }}
          title="Meta"
        >
          {/* Infinity / Meta Loop */}
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
            <path
              d="M7 8C4.79 8 3 9.79 3 12C3 14.21 4.79 16 7 16C9.21 16 11 13.5 12 12C13 10.5 14.79 8 17 8C19.21 8 21 9.79 21 12C21 14.21 19.21 16 17 16C14.79 16 13 13.5 12 12C11 10.5 9.21 8 7 8Z"
              stroke="url(#meta-grad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="meta-grad" x1="3" y1="8" x2="21" y2="16" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0668E1" />
                <stop offset="1" stopColor="#EC4899" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )

    case 'flipkart':
      return (
        <div
          className={`${sizeClasses} rounded-xl flex items-center justify-center font-black relative overflow-hidden flex-shrink-0 shadow-md ${className}`}
          style={{
            background: 'linear-gradient(135deg, rgba(40, 116, 240, 0.2) 0%, rgba(255, 229, 0, 0.15) 100%)',
            border: '1.5px solid rgba(40, 116, 240, 0.45)',
          }}
          title="Flipkart"
        >
          <div className="flex items-center">
            <span className="text-[#2874F0] font-black italic text-lg select-none">f</span>
            <span className="text-[#FFE500] text-[10px] font-bold ml-0.5">✦</span>
          </div>
        </div>
      )

    case 'infosys':
      return (
        <div
          className={`${sizeClasses} rounded-xl flex items-center justify-center font-black relative overflow-hidden flex-shrink-0 shadow-md ${className}`}
          style={{
            background: 'linear-gradient(135deg, rgba(0, 124, 195, 0.22) 0%, rgba(99, 102, 241, 0.15) 100%)',
            border: '1.5px solid rgba(0, 124, 195, 0.45)',
          }}
          title="Infosys"
        >
          <span className="font-extrabold text-[#007CC3] tracking-tighter text-base select-none">
            Infy
          </span>
        </div>
      )

    default:
      return (
        <div
          className={`${sizeClasses} rounded-xl flex items-center justify-center font-black relative overflow-hidden flex-shrink-0 bg-brand-indigo/15 border border-brand-indigo/30 text-brand-indigo shadow-md ${className}`}
        >
          {String(companyId).charAt(0).toUpperCase()}
        </div>
      )
  }
}
