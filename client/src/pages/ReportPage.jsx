import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { ScoreCard } from '../components/ScoreCard'
import { useAuth } from '../context/AuthContext'
import { interviewApi } from '../lib/api'
import { formatRole, formatSeniority } from '../lib/interviewMeta'

export const ReportPage = () => {
  const { token } = useAuth()
  const { sessionId } = useParams()
  const location = useLocation()
  const [report, setReport] = useState(location.state?.report || null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(!location.state?.report)

  useEffect(() => {
    if (report) {
      return undefined
    }

    const loadReport = async () => {
      try {
        const payload = await interviewApi.report(token, sessionId)
        setReport(payload.report)
      } catch (loadError) {
        setError(loadError.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadReport()
    return undefined
  }, [report, sessionId, token])

  if (isLoading) {
    return <p className="muted-note">Loading report...</p>
  }

  if (!report) {
    return <p className="form-error">{error || 'Report not found.'}</p>
  }

  const categoryEntries = Object.entries(report.categoryScores || {})
  const correctnessSummary = report.correctnessSummary || {
    correctAnswers: 0,
    partialAnswers: 0,
    incorrectAnswers: 0
  }

  return (
    <div className="report-layout">
      <section className="report-hero">
        <div>
          <p className="eyebrow">Interview report</p>
          <h1>
            {formatRole(report.role)} / {formatSeniority(report.seniority)}
          </h1>
          <p>{report.summary}</p>
        </div>

        <ScoreCard label="Overall score" value={report.overallScore} accent="ink" />
      </section>

      <section className="score-grid">
        <ScoreCard label="Correct answers" value={correctnessSummary.correctAnswers} accent="gold" />
        <ScoreCard label="Partial answers" value={correctnessSummary.partialAnswers} accent="coral" />
        <ScoreCard label="Incorrect answers" value={correctnessSummary.incorrectAnswers} accent="ink" />
      </section>

      <section className="score-grid">
        {categoryEntries.map(([key, value], index) => (
          <ScoreCard key={key} label={key} value={value} accent={index % 2 === 0 ? 'gold' : 'coral'} />
        ))}
      </section>

      <section className="report-columns">
        <article className="report-card">
          <h2>Strengths</h2>
          <ul>
            {report.strengths.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="report-card">
          <h2>Weaknesses</h2>
          <ul>
            {report.weaknesses.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="report-card full-width">
          <h2>Improvement tips</h2>
          <ul>
            {report.tips.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="list-panel">
        <div className="panel-header">
          <h2>Question by question review</h2>
          <Link className="ghost-button" to="/dashboard">
            Back to dashboard
          </Link>
        </div>

        <div className="transcript-list">
          {report.transcript.map((turn) => (
            <article className="transcript-card" key={turn.questionNumber}>
              <p className="eyebrow">
                Question {turn.questionNumber} / {turn.topic}
              </p>
              <div className="transcript-meta">
                <span className={`verdict-pill ${turn.verdict || 'partial'}`}>{turn.verdict || 'partial'}</span>
                <strong>{turn.accuracyScore ?? 0}% match</strong>
              </div>
              <h3>{turn.question}</h3>
              <p>{turn.answer}</p>
              {turn.verdict !== 'correct' && turn.idealAnswer ? (
                <div className="comparison-card ideal report-ideal-answer">
                  <span>AI ideal answer</span>
                  <p>{turn.idealAnswer}</p>
                </div>
              ) : null}
              <p className="answer-feedback">{turn.feedback}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
