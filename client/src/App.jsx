import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { ProtectedRoute } from './components/ProtectedRoute'
import { DashboardPage } from './pages/DashboardPage'
import { InterviewPage } from './pages/InterviewPage'
import { LandingPage } from './pages/LandingPage'
import { LoginPage } from './pages/LoginPage'
import { NewInterviewPage } from './pages/NewInterviewPage'
import { ReportPage } from './pages/ReportPage'
import { SignupPage } from './pages/SignupPage'

const App = () => (
  <AppShell>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/interview/new" element={<NewInterviewPage />} />
        <Route path="/interview/:sessionId" element={<InterviewPage />} />
        <Route path="/report/:sessionId" element={<ReportPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </AppShell>
)

export default App

