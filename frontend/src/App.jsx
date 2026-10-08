import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ApiStatusProvider } from './context/ApiStatusContext'
import ProtectedRoute from './components/ProtectedRoute'
import ErrorBoundary from './components/ErrorBoundary'
import ServerWakeIndicator from './components/ServerWakeIndicator'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Interview from './pages/Interview'
import Report from './pages/Report'
import Progress from './pages/Progress'
import NotFound from './pages/NotFound'

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <ApiStatusProvider>
            <Router>
              <div
                className="min-h-screen bg-bg-primary text-text-primary transition-colors duration-200"
                style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
              >
                <ServerWakeIndicator />
                <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Protected */}
            <Route path="/dashboard" element={
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            } />
            <Route path="/progress" element={
              <ProtectedRoute><Progress /></ProtectedRoute>
            } />
            <Route path="/interview" element={
              <ProtectedRoute><Interview /></ProtectedRoute>
            } />
            <Route path="/report" element={
              <ProtectedRoute><Report /></ProtectedRoute>
            } />
            <Route path="/report/:id" element={
              <ProtectedRoute><Report /></ProtectedRoute>
            } />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </ApiStatusProvider>
  </AuthProvider>
</ThemeProvider>
</ErrorBoundary>
  )
}

export default App
