import { motion, AnimatePresence } from 'framer-motion'
import { Server, Sparkles } from 'lucide-react'
import { useApiStatus } from '../context/ApiStatusContext'

export default function ServerWakeIndicator() {
  const { isWakingUp, elapsedSeconds } = useApiStatus()

  return (
    <AnimatePresence>
      {isWakingUp && (
        <motion.div
          key="server-wake-indicator"
          initial={{ opacity: 0, y: -24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg pointer-events-auto"
        >
          <div
            className="p-4 sm:p-5 rounded-2xl glass-card border border-indigo-500/30 shadow-2xl backdrop-blur-xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.92) 0%, rgba(15, 23, 42, 0.95) 100%)',
              boxShadow: '0 20px 40px -15px rgba(99, 102, 241, 0.35), 0 0 0 1px rgba(99, 102, 241, 0.2)',
            }}
          >
            {/* Top glowing ambient highlight */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />

            <div className="flex items-start gap-4">
              {/* Dual ring animated spinner */}
              <div className="relative flex-shrink-0 mt-0.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center relative">
                  <Server className="w-5 h-5 text-indigo-400" />
                  {/* Outer spinning ring */}
                  <div className="absolute -inset-1 rounded-xl border-2 border-indigo-500/40 border-t-indigo-400 animate-spin" />
                </div>
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wide uppercase text-indigo-300">
                    <Sparkles className="w-3 h-3 text-indigo-400 animate-pulse" />
                    <span>Server Initializing</span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-indigo-300">
                    {elapsedSeconds}s elapsed
                  </span>
                </div>

                <h3 className="text-sm font-bold text-white leading-snug">
                  Waking up the interview server... this can take up to a minute on first visit
                </h3>

                <p className="text-xs text-indigo-200/70 mt-1 leading-relaxed">
                  Render's free tier spins down idle instances. We're warming up the AI engine so your interview questions and feedback load smoothly.
                </p>

                {/* Animated progress bar */}
                <div className="mt-3 w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 rounded-full animate-pulse"
                    style={{
                      width: `${Math.min(95, Math.max(15, (elapsedSeconds / 45) * 100))}%`,
                      transition: 'width 1s ease',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
