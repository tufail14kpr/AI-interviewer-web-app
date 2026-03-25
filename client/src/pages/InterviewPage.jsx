import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { interviewApi } from '../lib/api'
import { formatRole, formatSeniority } from '../lib/interviewMeta'

export const InterviewPage = () => {
  const { token } = useAuth()
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState(null)
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadSession = async () => {
      try {
        const payload = await interviewApi.get(token, sessionId)
        setSession(payload.session)

        if (payload.session.status === 'completed') {
          navigate(`/report/${sessionId}`, { replace: true })
        }
      } catch (loadError) {
        setError(loadError.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadSession()
  }, [navigate, sessionId, token])

  const completeInterview = async () => {
    const completion = await interviewApi.complete(token, sessionId)
    navigate(`/report/${sessionId}`, { replace: true, state: { report: completion.report } })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const payload = await interviewApi.answer(token, sessionId, { answer })
      setSession(payload.session)
      setAnswer('')

      if (payload.status === 'ready_for_completion') {
        await completeInterview()
      }
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <p className="muted-note">Loading interview...</p>
  }

  if (!session) {
    return <p className="form-error">{error || 'Interview session not found.'}</p>
  }

  const currentQuestion = session.currentQuestion
  const answeredTurns = session.turns.filter((turn) => turn.answer)

  return (
    <div className="interview-layout">
      <section className="interview-sidebar">
        <p className="eyebrow">Interview session</p>
        <h1>
          {formatRole(session.role)} · {formatSeniority(session.seniority)}
        </h1>
        <p>
          {session.answeredQuestions} answered of {session.targetQuestionCount}. The current question stays in the transcript until you finish the session.
        </p>

        <div className="progress-card">
          <span>Remaining estimate</span>
          <strong>{session.remainingEstimated}</strong>
        </div>

        {session.generationState?.retryableMessage ? (
          <p className="form-error">{session.generationState.retryableMessage}</p>
        ) : null}

        <Link className="ghost-button" to="/dashboard">
          Back to dashboard
        </Link>
      </section>

      <section className="interview-panel">
        <div className="panel-header">
          <h2>Transcript</h2>
          <small>One question at a time, with all prior answers preserved.</small>
        </div>

        <div className="chat-stack">
          {answeredTurns.map((turn) => (
            <div className="chat-pair" key={turn.questionNumber}>
              <article className="chat-bubble interviewer">
                <span>Q{turn.questionNumber}</span>
                <p>{turn.question}</p>
              </article>
              <article className="chat-bubble candidate">
                <span>Your answer</span>
                <p>{turn.answer}</p>
              </article>
            </div>
          ))}

          {currentQuestion ? (
            <article className="chat-bubble interviewer current">
              <span>Q{currentQuestion.questionNumber}</span>
              <p>{currentQuestion.question}</p>
            </article>
          ) : null}
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        {currentQuestion ? (
          <form className="answer-card" onSubmit={handleSubmit}>
            <label className="field">
              <span>Your answer</span>
              <textarea
                name="answer"
                rows="8"
                placeholder="Structure your answer with context, reasoning, tradeoffs, and validation."
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                required
              />
            </label>

            <button className="primary-button" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Saving answer...' : 'Submit Answer'}
            </button>
          </form>
        ) : (
          <button className="primary-button" onClick={completeInterview} type="button">
            Complete Interview
          </button>
        )}
      </section>
    </div>
  )
}

