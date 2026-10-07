import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('theme') || localStorage.getItem('interviewsense-theme')
      if (saved === 'light' || saved === 'dark') {
        return saved
      }
    } catch (e) {
      console.warn('Unable to access localStorage for theme:', e)
    }
    // Default to dark mode
    return 'dark'
  })

  useEffect(() => {
    try {
      const root = document.documentElement
      if (theme === 'light') {
        root.classList.remove('dark')
        root.classList.add('light')
        root.style.colorScheme = 'light'
      } else {
        root.classList.remove('light')
        root.classList.add('dark')
        root.style.colorScheme = 'dark'
      }
      localStorage.setItem('theme', theme)
      localStorage.setItem('interviewsense-theme', theme)
    } catch (e) {
      console.warn('Unable to save theme to localStorage:', e)
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
