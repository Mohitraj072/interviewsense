/**
 * Company-Specific Interviews Configuration & Metadata
 * 
 * Defines target companies, their interview focus areas, brand styling,
 * and company readiness scoring heuristics.
 */

export const COMPANIES = [
  {
    id: 'Google',
    name: 'Google',
    tagline: 'Bar raiser for algorithmic depth & scalable system design',
    accentColor: '#4285F4',
    secondaryColor: '#34A853',
    gradient: 'from-[#4285F4]/20 via-[#EA4335]/15 to-[#34A853]/20',
    borderActive: 'border-[#4285F4]',
    badgeBg: 'bg-[#4285F4]/15 text-[#4285F4] border-[#4285F4]/30',
    focus: ['Algorithms', 'System Design', 'Googleyness'],
    focusDescriptions: {
      'Algorithms': 'Time/space optimization, graphs, DP & trees',
      'System Design': 'Global distributed systems, latency & trade-offs',
      'Googleyness': 'Navigating ambiguity, intellectual humility & collaboration',
    },
    hiringCriteria: 'Expects rigorous algorithmic efficiency, clean modular code, distributed architecture tradeoffs, and strong collaborative communication (Googleyness).',
    prepTip: 'Clarify constraints early, state runtime Big-O explicitly, and articulate system design tradeoffs with quantitative justifications.',
  },
  {
    id: 'Amazon',
    name: 'Amazon',
    tagline: 'Customer obsession & ownership at massive operational scale',
    accentColor: '#FF9900',
    secondaryColor: '#146EB4',
    gradient: 'from-[#FF9900]/20 via-[#FF9900]/10 to-[#146EB4]/20',
    borderActive: 'border-[#FF9900]',
    badgeBg: 'bg-[#FF9900]/15 text-[#FF9900] border-[#FF9900]/30',
    focus: ['Leadership Principles', 'DSA', 'Behavioral'],
    focusDescriptions: {
      'Leadership Principles': 'Customer Obsession, Ownership, Bias for Action, Have Backbone',
      'DSA': 'Efficient data structures, caches & concurrency handling',
      'Behavioral': 'STAR format stories with clear quantified business outcomes',
    },
    hiringCriteria: 'Evaluates candidates strictly against the 16 Leadership Principles alongside practical coding speed and operational excellence.',
    prepTip: 'Structure every behavioral answer using the STAR method with specific personal contributions ("I", not "we") and concrete numeric metrics.',
  },
  {
    id: 'Microsoft',
    name: 'Microsoft',
    tagline: 'Real-world software craftsmanship & enterprise engineering',
    accentColor: '#00A4EF',
    secondaryColor: '#7FBA00',
    gradient: 'from-[#00A4EF]/20 via-[#7FBA00]/15 to-[#F25022]/20',
    borderActive: 'border-[#00A4EF]',
    badgeBg: 'bg-[#00A4EF]/15 text-[#00A4EF] border-[#00A4EF]/30',
    focus: ['Problem Solving', 'Culture Fit', 'Technical'],
    focusDescriptions: {
      'Problem Solving': 'Edge case handling, code correctness & debugging',
      'Culture Fit': 'Growth mindset, empathy, cross-team collaboration',
      'Technical': 'OOP, clean APIs, design patterns & system reliability',
    },
    hiringCriteria: 'Prioritizes robust maintainable code, test-driven thinking, handling edge cases, and genuine alignment with a growth mindset culture.',
    prepTip: 'Write production-ready code with defensive checks, explain edge-case mitigation, and demonstrate enthusiasm for learning from mistakes.',
  },
  {
    id: 'Meta',
    name: 'Meta',
    tagline: 'High execution velocity, clean code & global-scale systems',
    accentColor: '#0668E1',
    secondaryColor: '#9333EA',
    gradient: 'from-[#0668E1]/20 via-[#9333EA]/20 to-[#EC4899]/20',
    borderActive: 'border-[#0668E1]',
    badgeBg: 'bg-[#0668E1]/15 text-[#0668E1] border-[#0668E1]/30',
    focus: ['Coding', 'System Design', 'Behavioral'],
    focusDescriptions: {
      'Coding': 'Rapid, bug-free coding in under 20 mins per problem',
      'System Design': 'Massive concurrent feeds, caching layers & fan-out',
      'Behavioral': 'Move fast, resolve conflicts, and drive bold impact',
    },
    hiringCriteria: 'High speed coding with minimal hints, deep intuition for distributed social-scale systems, and demonstrated high-impact execution.',
    prepTip: 'Practice completing LeetCode medium/hard problems bug-free in 15-20 minutes and master high-throughput message queue/caching architectures.',
  },
  {
    id: 'Flipkart',
    name: 'Flipkart',
    tagline: 'High-concurrency e-commerce scale & product-first engineering',
    accentColor: '#2874F0',
    secondaryColor: '#FFE500',
    gradient: 'from-[#2874F0]/20 via-[#2874F0]/10 to-[#FFE500]/20',
    borderActive: 'border-[#2874F0]',
    badgeBg: 'bg-[#2874F0]/15 text-[#2874F0] border-[#2874F0]/30',
    focus: ['DSA', 'System Design', 'Product Thinking'],
    focusDescriptions: {
      'DSA': 'Trees, graphs, heaps & search optimization algorithms',
      'System Design': 'Flash-sale surges, inventory locking & payment gateways',
      'Product Thinking': 'Customer journey intuition & business metrics awareness',
    },
    hiringCriteria: 'Tests strong core DSA, machine coding / LLD capabilities, flash sale resilience, and user-first product empathy.',
    prepTip: 'Be prepared to design low-level classes with SOLID principles and architect high-concurrency order placement pipelines with idempotency.',
  },
  {
    id: 'Infosys',
    name: 'Infosys',
    tagline: 'Computer science fundamentals, analytical aptitude & communication',
    accentColor: '#007CC3',
    secondaryColor: '#6366F1',
    gradient: 'from-[#007CC3]/20 via-[#6366F1]/15 to-[#007CC3]/10',
    borderActive: 'border-[#007CC3]',
    badgeBg: 'bg-[#007CC3]/15 text-[#007CC3] border-[#007CC3]/30',
    focus: ['Aptitude', 'Technical', 'HR'],
    focusDescriptions: {
      'Aptitude': 'Quantitative reasoning, logical puzzles & time-speed-work',
      'Technical': 'OOP, DBMS, SQL joins, OS threading & core programming',
      'HR': 'Adaptability, project communication, and professional ethics',
    },
    hiringCriteria: 'Values structured problem solving, clear fundamentals in databases and OOP, and articulate, client-ready communication.',
    prepTip: 'Brush up on core OOP definitions, SQL normalization/joins, basic quantitative aptitude tricks, and confident English communication.',
  },
]

export function getCompanyById(id) {
  if (!id) return null
  const normalized = String(id).toLowerCase().trim()
  return COMPANIES.find((c) => c.id.toLowerCase() === normalized) || null
}

/**
 * Calculates Company Readiness metrics based on overall interview score and answered questions.
 */
export function calculateCompanyReadiness(companyId, overallScore, answeredCount = 5) {
  const company = getCompanyById(companyId) || {
    id: companyId || 'Target Company',
    name: companyId || 'Target Company',
    focus: ['Technical', 'Problem Solving', 'Communication'],
  }

  const score = typeof overallScore === 'number' ? Math.round(overallScore) : null

  if (score === null || answeredCount === 0) {
    return {
      company,
      score: null,
      percentage: 0,
      tier: 'unrated',
      badgeText: 'Not Evaluated',
      badgeColor: 'text-text-muted bg-white/5 border-white/10',
      summary: 'Complete interview questions to unlock your company readiness assessment.',
      recommendation: company.prepTip || 'Practice domain questions and complete full mock interviews.',
    }
  }

  // Determine readiness tier
  if (score >= 85) {
    return {
      company,
      score,
      percentage: score,
      tier: 'high',
      status: 'High Readiness',
      badgeText: `Ready for ${company.name}`,
      verdictText: 'Strong Hiring Recommendation',
      badgeColor: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
      glowColor: 'rgba(16, 185, 129, 0.25)',
      summary: `Your performance firmly meets ${company.name}'s hiring bar. Strong mastery across ${company.focus.join(', ')}.`,
      recommendation: `Maintain your momentum with full mock loops under strict timing. You are well positioned for an onsite offer at ${company.name}.`,
    }
  }

  if (score >= 70) {
    return {
      company,
      score,
      percentage: score,
      tier: 'competitive',
      status: 'Competitive Readiness',
      badgeText: `On Track for ${company.name}`,
      verdictText: 'Competitive Contender',
      badgeColor: 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30',
      glowColor: 'rgba(99, 102, 241, 0.25)',
      summary: `You are close to the benchmark for ${company.name}. You demonstrated good command of ${company.focus[0]} and ${company.focus[1]}.`,
      recommendation: `Focus on sharpening ${company.focus[2] || 'behavioral depth'} and edge-case handling. One or two targeted practice sessions will put you over the hiring bar.`,
    }
  }

  if (score >= 50) {
    return {
      company,
      score,
      percentage: score,
      tier: 'moderate',
      status: 'Moderate Readiness',
      badgeText: `Developing for ${company.name}`,
      verdictText: 'Needs Targeted Practice',
      badgeColor: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
      glowColor: 'rgba(245, 158, 11, 0.25)',
      summary: `You have foundational competence for ${company.name}, but answers lacked the technical depth and precision expected in real interview loops.`,
      recommendation: company.prepTip || `Review core concepts in ${company.focus.join(' and ')} before scheduling your official interview.`,
    }
  }

  return {
    company,
    score,
    percentage: score,
    tier: 'foundational',
    status: 'Foundational',
    badgeText: `Needs Prep for ${company.name}`,
    verdictText: 'Additional Preparation Recommended',
    badgeColor: 'text-rose-400 bg-rose-500/15 border-rose-500/30',
    glowColor: 'rgba(244, 63, 94, 0.25)',
    summary: `Your score is currently below the typical hiring bar for ${company.name}. Key concepts in ${company.focus.join(', ')} require dedicated study.`,
    recommendation: `Spend 1-2 weeks revising core algorithms and data structures, then retake this company-specific mock session.`,
  }
}
