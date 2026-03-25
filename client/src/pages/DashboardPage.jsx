import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { interviewApi } from '../lib/api'
import { formatRole, formatSeniority } from '../lib/interviewMeta'

export const DashboardPage = () => {
  const { token, user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const payload = await interviewApi.list(token)
        setSessions(payload.sessions)
      } catch (loadError) {
        setError(loadError.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadSessions()
  }, [token])

  const latestScore = sessions.find((session) => session.overallScore !== null)?.overallScore ?? '--'

  return (
    <div className="dashboard-layout">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">Candidate dashboard</p>
          <h1>{user?.name}, keep your interview reps focused.</h1>
          <p>
            Launch a new role-specific session or review the ones you already completed. Reports stay tied to your account.
          </p>
        </div>

        <Link className="primary-button" to="/interview/new">
          Start Interview
        </Link>
      </section>

      <section className="dashboard-stats">
        <article className="metric-card">
          <span>Total sessions</span>
          <strong>{sessions.length}</strong>
        </article>
        <article className="metric-card">
          <span>Latest score</span>
          <strong>{latestScore}</strong>
        </article>
        <article className="metric-card">
          <span>Completed reports</span>
          <strong>{sessions.filter((session) => session.status === 'completed').length}</strong>
        </article>
      </section>

      <section className="list-panel">
        <div className="panel-header">
          <h2>Interview history</h2>
          <small>Resume active sessions or open finished reports.</small>
        </div>

        {isLoading ? <p className="muted-note">Loading sessions...</p> : null}
        {error ? <p className="form-error">{error}</p> : null}

        {!isLoading && !sessions.length ? (
          <div className="empty-panel">
            <h3>No interviews yet</h3>
            <p>Create your first frontend, backend, or fullstack session to begin building history.</p>
          </div>
        ) : null}

        <div className="session-list">
          {sessions.map((session) => (
            <article className="session-card" key={session.id}>
              <div>
                <p className="eyebrow">
                  {formatRole(session.role)} · {formatSeniority(session.seniority)}
                </p>
                <h3>{session.status === 'completed' ? 'Completed interview' : 'Active interview'}</h3>
                <p>
                  {session.answeredQuestions} / {session.targetQuestionCount} answers recorded
                </p>
              </div>

              <div className="session-meta">
                <span className={`status-pill ${session.status}`}>{session.status}</span>
                {session.overallScore !== null ? <strong>Score {session.overallScore}</strong> : null}
              </div>

              <Link
                className="ghost-button"
                to={session.status === 'completed' ? `/report/${session.id}` : `/interview/${session.id}`}
              >
                {session.status === 'completed' ? 'Open Report' : 'Resume Interview'}
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

