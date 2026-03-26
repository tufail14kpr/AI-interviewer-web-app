import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { adminApi } from '../lib/api'
import { formatRole, formatSeniority, roleOptions, seniorityOptions } from '../lib/interviewMeta'

export const AdminDashboardPage = () => {
  const { token, user } = useAuth()
  const [overview, setOverview] = useState({
    stats: {
      totalUsers: 0,
      totalInterviews: 0,
      completedReports: 0,
      activeInterviews: 0
    },
    users: [],
    interviews: []
  })
  const [form, setForm] = useState({
    userId: '',
    role: 'frontend',
    seniority: 'junior'
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadOverview = async () => {
    try {
      const payload = await adminApi.overview(token)
      setOverview(payload)
      setForm((current) => ({
        ...current,
        userId: current.userId || payload.users[0]?.id || ''
      }))
    } catch (loadError) {
      setError(loadError.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadOverview()
  }, [token])

  const handleChange = (event) => {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      await adminApi.createInterview(token, form)
      await loadOverview()
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="dashboard-layout">
      <section className="dashboard-hero admin-hero">
        <div>
          <p className="eyebrow">Admin dashboard</p>
          <h1>{user?.name}, review candidates and create interviews.</h1>
          <p>
            Open interview reports, inspect candidate answers, compare them with the AI ideal answer, and assign new interviews to logged-in users.
          </p>
        </div>
      </section>

      <section className="dashboard-stats">
        <article className="metric-card">
          <span>Candidates</span>
          <strong>{overview.stats.totalUsers}</strong>
        </article>
        <article className="metric-card">
          <span>Total interviews</span>
          <strong>{overview.stats.totalInterviews}</strong>
        </article>
        <article className="metric-card">
          <span>Completed reports</span>
          <strong>{overview.stats.completedReports}</strong>
        </article>
      </section>

      <section className="admin-grid">
        <form className="setup-card" onSubmit={handleSubmit}>
          <div className="panel-header">
            <h2>Create interview for candidate</h2>
            <small>Admin-assigned session</small>
          </div>

          <label className="field">
            <span>Candidate</span>
            <select name="userId" value={form.userId} onChange={handleChange} required>
              <option value="" disabled>
                Select candidate
              </option>
              {overview.users.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.name} / {candidate.email}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Role</span>
            <select name="role" value={form.role} onChange={handleChange}>
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Seniority</span>
            <select name="seniority" value={form.seniority} onChange={handleChange}>
              {seniorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button className="primary-button" type="submit" disabled={isSubmitting || !overview.users.length}>
            {isSubmitting ? 'Creating interview...' : 'Create Interview'}
          </button>
        </form>

        <section className="list-panel">
          <div className="panel-header">
            <h2>Candidate accounts</h2>
            <small>Logged-in users visible to admin</small>
          </div>

          {isLoading ? <p className="muted-note">Loading admin data...</p> : null}

          {!overview.users.length && !isLoading ? (
            <div className="empty-panel">
              <h3>No candidates yet</h3>
              <p>Candidate accounts will appear here after users sign up.</p>
            </div>
          ) : null}

          <div className="candidate-list">
            {overview.users.map((candidate) => (
              <article className="session-card" key={candidate.id}>
                <div>
                  <p className="eyebrow">Candidate</p>
                  <h3>{candidate.name}</h3>
                  <p>{candidate.email}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>

      <section className="list-panel">
        <div className="panel-header">
          <h2>Interview review queue</h2>
          <small>Review active sessions and completed reports</small>
        </div>

        <div className="session-list">
          {overview.interviews.map((session) => (
            <article className="session-card" key={session.id}>
              <div>
                <p className="eyebrow">
                  {session.user?.name || 'Candidate'} / {session.user?.email || 'Unknown'}
                </p>
                <h3>
                  {formatRole(session.role)} / {formatSeniority(session.seniority)}
                </h3>
                <p>
                  {session.answeredQuestions} / {session.targetQuestionCount} answers / {session.status}
                </p>
              </div>

              <div className="session-meta">
                <span className={`status-pill ${session.status}`}>{session.status}</span>
                {session.overallScore !== null ? <strong>Score {session.overallScore}</strong> : null}
              </div>

              <Link className="ghost-button" to={`/admin/interviews/${session.id}`}>
                Review Interview
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

