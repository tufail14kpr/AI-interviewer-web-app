import { Link } from 'react-router-dom'

const roleCards = [
  {
    title: 'Frontend',
    text: 'Stay inside browser, React, accessibility, performance, and shipping UI tradeoffs.'
  },
  {
    title: 'Backend',
    text: 'Focus on APIs, data, auth, reliability, observability, and production architecture.'
  },
  {
    title: 'Fullstack',
    text: 'Blend UI and server thinking across end-to-end product delivery.'
  }
]

export const LandingPage = () => (
  <div className="landing-grid">
    <section className="hero-panel">
      <p className="eyebrow">Adaptive mock interviews for engineers</p>
      <h1>Train for real technical interviews with a role-specific AI interviewer.</h1>
      <p className="hero-copy">
        Choose frontend, backend, or fullstack. Set your target seniority. Then work through a
        20-25 question interview that stays inside your role instead of drifting into irrelevant topics.
      </p>

      <div className="hero-actions">
        <Link className="primary-button" to="/signup">
          Create Account
        </Link>
        <Link className="ghost-button" to="/login">
          Resume Practice
        </Link>
      </div>

      <div className="stat-row">
        <div className="stat-card">
          <strong>20-25</strong>
          <span>adaptive questions</span>
        </div>
        <div className="stat-card">
          <strong>3</strong>
          <span>core interview tracks</span>
        </div>
        <div className="stat-card">
          <strong>5</strong>
          <span>rubric score dimensions</span>
        </div>
      </div>
    </section>

    <section className="stack-panel">
      <div className="panel-header">
        <p className="eyebrow">Interview tracks</p>
        <h2>Every session stays on-role.</h2>
      </div>

      <div className="feature-column">
        {roleCards.map((card) => (
          <article className="feature-card" key={card.title}>
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </article>
        ))}
      </div>

      <div className="feature-card slate">
        <h3>Report after every session</h3>
        <p>
          Review strengths, weaknesses, improvement tips, category scores, and the full transcript
          from each interview.
        </p>
      </div>
    </section>
  </div>
)
