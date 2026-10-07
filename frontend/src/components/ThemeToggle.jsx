import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle({ className = '', id = 'theme-toggle-btn' }) {
  const { theme, toggleTheme, isDark } = useTheme()

  return (
    <button
      id={id}
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer overflow-hidden border ${
        isDark
          ? 'bg-white/5 border-white/10 text-yellow-300 hover:bg-white/10 hover:border-white/20 hover:text-yellow-200'
          : 'bg-black/5 border-slate-200 text-amber-500 hover:bg-black/10 hover:border-slate-300 hover:text-amber-600'
      } ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="dark-moon"
            initial={{ rotate: -90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="flex items-center justify-center"
          >
            <Moon className="w-4 h-4 fill-yellow-300/30 text-yellow-300" />
          </motion.div>
        ) : (
          <motion.div
            key="light-sun"
            initial={{ rotate: 90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="flex items-center justify-center"
          >
            <Sun className="w-4 h-4 text-amber-500 fill-amber-500/25" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  )
}
