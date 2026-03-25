import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { interviewApi } from '../lib/api'
import { roleOptions, seniorityOptions } from '../lib/interviewMeta'

export const NewInterviewPage = () => {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ role: 'frontend', seniority: 'junior' })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      const payload = await interviewApi.create(token, form)
      navigate(`/interview/${payload.session.id}`)
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="setup-layout">
      <div className="panel-header">
        <p className="eyebrow">Interview setup</p>
        <h1>Choose the role and level you want to practice.</h1>
      </div>

      <form className="setup-card" onSubmit={handleSubmit}>
        <div className="option-grid">
          {roleOptions.map((option) => (
            <label className={`select-card${form.role === option.value ? ' selected' : ''}`} key={option.value}>
              <input
                checked={form.role === option.value}
                name="role"
                onChange={handleChange}
                type="radio"
                value={option.value}
              />
              <strong>{option.label}</strong>
              <span>{option.description}</span>
            </label>
          ))}
        </div>

        <div className="option-grid compact">
          {seniorityOptions.map((option) => (
            <label
              className={`select-card compact${form.seniority === option.value ? ' selected' : ''}`}
              key={option.value}
            >
              <input
                checked={form.seniority === option.value}
                name="seniority"
                onChange={handleChange}
                type="radio"
                value={option.value}
              />
              <strong>{option.label}</strong>
              <span>{option.description}</span>
            </label>
          ))}
        </div>

        <div className="summary-strip">
          <div>
            <span>Interview format</span>
            <strong>Text-based, adaptive questions, saved transcript</strong>
          </div>
          <div>
            <span>Expected length</span>
            <strong>{form.role === 'fullstack' ? '23-25 questions' : '20-22 questions'}</strong>
          </div>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Preparing interview...' : 'Start Interview'}
        </button>
      </form>
    </section>
  )
}
