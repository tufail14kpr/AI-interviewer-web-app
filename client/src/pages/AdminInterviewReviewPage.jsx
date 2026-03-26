import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ScoreCard } from '../components/ScoreCard'
import { useAuth } from '../context/AuthContext'
import { adminApi } from '../lib/api'
import { formatRole, formatSeniority } from '../lib/interviewMeta'

export const AdminInterviewReviewPage = () => {
  const { token } = useAuth()
  const { sessionId } = useParams()
  const [data, setData] = useState({ session: null, report: null })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadInterview = async () => {
      try {
        const payload = await adminApi.getInterview(token, sessionId)
        setData(payload)
      } catch (loadError) {
        setError(loadError.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadInterview()
  }, [sessionId, token])

  if (isLoading) {
    return <p className="muted-note">Loading admin review...</p>
  }

  if (!data.session) {
    return <p className="form-error">{error || 'Interview review not found.'}</p>
  }

  const report = data.report
  const transcript = report?.transcript || data.session.turns || []
  const correctnessSummary = report?.correctnessSummary || {
    correctAnswers: 0,
    partialAnswers: 0,
    incorrectAnswers: 0
  }

  return (
    <div className="report-layout">
      <section className="report-hero">
        <div>
          <p className="eyebrow">Admin review</p>
          <h1>
            {formatRole(data.session.role)} / {formatSeniority(data.session.seniority)}
          </h1>
          <p>
            Candidate: {data.session.user?.name || 'Unknown'} / {data.session.user?.email || 'Unknown'} / Status:{' '}
            {data.session.status}
          </p>
        </div>

        <div className="admin-review-actions">
          {report ? <ScoreCard label="Overall score" value={report.overallScore} accent="ink" /> : null}
          <Link className="ghost-button" to="/admin">
            Back to admin
          </Link>
        </div>
      </section>

      {report ? (
        <>
          <section className="score-grid">
            <ScoreCard label="Correct answers" value={correctnessSummary.correctAnswers} accent="gold" />
            <ScoreCard label="Partial answers" value={correctnessSummary.partialAnswers} accent="coral" />
            <ScoreCard label="Incorrect answers" value={correctnessSummary.incorrectAnswers} accent="ink" />
          </section>

          <section className="score-grid">
            {Object.entries(report.categoryScores || {}).map(([key, value], index) => (
              <ScoreCard key={key} label={key} value={value} accent={index % 2 === 0 ? 'gold' : 'coral'} />
            ))}
          </section>
        </>
      ) : (
        <section className="list-panel">
          <h2>Report pending</h2>
          <p>This interview is still active. Admin can already inspect the candidate answers below.</p>
        </section>
      )}

      <section className="list-panel">
        <div className="panel-header">
          <h2>Answer comparison</h2>
          <small>Candidate answer vs AI ideal answer</small>
        </div>

        <div className="transcript-list">
          {transcript.map((turn) => (
            <article className="transcript-card" key={turn.questionNumber}>
              <p className="eyebrow">
                Question {turn.questionNumber} / {turn.topic}
              </p>
              <div className="transcript-meta">
                <span className={`verdict-pill ${turn.verdict || 'partial'}`}>{turn.verdict || 'pending'}</span>
                <strong>{turn.accuracyScore ?? 0}% match</strong>
              </div>
              <h3>{turn.question}</h3>
              <div className="comparison-grid">
                <article className="comparison-card">
                  <span>Candidate answer</span>
                  <p>{turn.answer || 'No answer yet.'}</p>
                </article>

                <article className="comparison-card ideal">
                  <span>AI ideal answer</span>
                  <p>{turn.idealAnswer || 'Ideal answer is generated after evaluation is complete.'}</p>
                </article>
              </div>
              {turn.feedback ? <p className="answer-feedback">{turn.feedback}</p> : null}
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
