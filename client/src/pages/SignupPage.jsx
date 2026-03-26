import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export const SignupPage = () => {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
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
      const result = await signup(form)
      navigate(result.user?.role === 'admin' ? '/admin' : '/dashboard', { replace: true })
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-layout">
      <div className="auth-copy">
        <p className="eyebrow">Set up your interview workspace</p>
        <h1>Create your candidate account.</h1>
        <p>
          Track mock interviews over time, switch between engineering roles, and compare reports across sessions.
        </p>
      </div>

      <form className="auth-card" onSubmit={handleSubmit}>
        <label className="field">
          <span>Name</span>
          <input name="name" type="text" value={form.name} onChange={handleChange} required />
        </label>

        <label className="field">
          <span>Email</span>
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            minLength={8}
            required
          />
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </button>

        <p className="muted-note">
          Already registered? <Link to="/login">Log in here</Link>.
        </p>
      </form>
    </section>
  )
}
