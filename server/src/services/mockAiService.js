import {
  RUBRIC_CATEGORIES,
  ROLE_BLUEPRINTS,
  getQuestionStyle,
  getRemainingTopics
} from '../lib/interviewBlueprint.js'

const fallbackQuestionStarters = {
  theory: {
    junior: 'Explain the basics of',
    mid: 'How would you reason about',
    senior: 'What tradeoffs do you evaluate when designing'
  },
  scenario: {
    junior: 'You notice an issue with',
    mid: 'A production feature is struggling because of',
    senior: 'Your team is scaling a system impacted by'
  },
  practical: {
    junior: 'Walk through how you would implement',
    mid: 'Describe how you would ship and validate',
    senior: 'How would you lead the architecture and rollout for'
  }
}

const topicLabels = {
  html_semantics: 'semantic HTML for a user-facing feature',
  css_layout: 'a responsive layout with CSS Grid and Flexbox',
  javascript_fundamentals: 'JavaScript async behavior and event flow',
  typescript: 'TypeScript boundaries and safer component APIs',
  react_state: 'React state management for a growing interface',
  component_architecture: 'component architecture in a maintainable UI',
  performance: 'performance bottlenecks in a production application',
  accessibility: 'accessibility issues in a real product flow',
  testing: 'testing coverage for a critical feature',
  api_design: 'designing an API that remains easy to evolve',
  database_design: 'database schema decisions for a scaling product',
  authentication: 'authentication and authorization for a new feature',
  system_design: 'service boundaries for a multi-feature platform',
  scalability: 'scaling bottlenecks under rising traffic',
  security: 'security risks in a shipped application',
  observability: 'how to monitor and debug production incidents'
}

const categoryDefaultsBySeniority = {
  junior: 62,
  mid: 70,
  senior: 78
}

const QUESTION_VARIANTS = {
  html_semantics: {
    theory: [
      'semantic HTML for a user-facing feature',
      'why semantic elements matter in a production interface',
      'how proper document structure improves accessibility and maintainability'
    ],
    scenario: [
      'an e-commerce page where assistive tech users cannot navigate the content',
      'a marketing page built with div-heavy markup that needs cleanup',
      'a checkout flow where headings and landmarks are confusing'
    ],
    practical: [
      'the markup structure for a complex product detail page',
      'a reusable form layout with labels, error messaging, and landmarks',
      'a dashboard page that needs clear content hierarchy'
    ]
  },
  css_layout: {
    theory: [
      'a responsive layout with CSS Grid and Flexbox',
      'when to choose Grid over Flexbox in a component system',
      'how layout primitives affect maintainability across screen sizes'
    ],
    scenario: [
      'a dashboard layout breaking on tablets and smaller laptops',
      'a content-heavy page with alignment issues across breakpoints',
      'a card grid that collapses badly when content length changes'
    ],
    practical: [
      'a reusable responsive page shell for desktop and mobile',
      'a component layout that must handle variable content safely',
      'a product listing page with stable spacing and alignment'
    ]
  },
  javascript_fundamentals: {
    theory: [
      'JavaScript async behavior and event flow',
      'the event loop, promises, and microtasks in real apps',
      'how closures and async execution affect application bugs'
    ],
    scenario: [
      'an interface that shows stale data after multiple rapid requests',
      'an async bug caused by race conditions in user interactions',
      'a production issue where delayed updates overwrite newer state'
    ],
    practical: [
      'an async data-loading flow with retry and cancellation behavior',
      'a client feature that coordinates multiple dependent API requests',
      'a robust fetch layer that handles loading, success, and failure states'
    ]
  },
  typescript: {
    theory: [
      'TypeScript boundaries and safer component APIs',
      'how static types reduce runtime bugs in frontend codebases',
      'when to use unions, generics, and narrowing effectively'
    ],
    scenario: [
      'a codebase where loose typing keeps causing regressions',
      'a component library with confusing prop contracts',
      'a team struggling with unsafe API response handling'
    ],
    practical: [
      'a typed form flow with reusable field components',
      'a safer API client layer using shared response types',
      'a component API that prevents invalid state combinations'
    ]
  },
  react_state: {
    theory: [
      'React state management for a growing interface',
      'how local state, lifted state, and derived state should be balanced',
      'the tradeoffs between simple state and more structured state flows'
    ],
    scenario: [
      'a UI with prop drilling and inconsistent updates',
      'a form flow where multiple widgets drift out of sync',
      'a performance issue caused by overly broad state updates'
    ],
    practical: [
      'a state model for a multi-step product workflow',
      'a React screen that coordinates filters, pagination, and async data',
      'a reusable pattern for handling loading, editing, and error states'
    ]
  },
  component_architecture: {
    theory: [
      'component architecture in a maintainable UI',
      'how to separate presentation, composition, and business logic in React',
      'what makes a component system scalable over time'
    ],
    scenario: [
      'a design system with duplicated components and drifting patterns',
      'a feature area that became difficult to extend safely',
      'a UI codebase where too much logic sits in page components'
    ],
    practical: [
      'a component structure for a large product surface',
      'a maintainable feature module with reusable UI and business logic layers',
      'a shared component strategy across multiple teams'
    ]
  },
  performance: {
    theory: [
      'performance bottlenecks in a production application',
      'frontend and backend signals that indicate a performance problem',
      'how rendering, network, and data decisions affect user experience'
    ],
    scenario: [
      'a feature that became slow after launch under heavier traffic',
      'a page with rendering jank and delayed interactions',
      'an API-driven screen where latency hurts conversion'
    ],
    practical: [
      'a performance improvement plan for a critical user flow',
      'an investigation process for a slow product experience',
      'a rollout to improve speed without risking regressions'
    ]
  },
  accessibility: {
    theory: [
      'accessibility issues in a real product flow',
      'how semantics, focus management, and contrast work together',
      'why accessibility needs to be part of standard frontend delivery'
    ],
    scenario: [
      'a modal flow that traps keyboard users incorrectly',
      'a complex form that screen reader users cannot complete confidently',
      'a product area failing accessibility QA before release'
    ],
    practical: [
      'an accessibility checklist for a shipped feature',
      'a remediation plan for a broken interaction flow',
      'a robust accessible pattern for dialogs, forms, and navigation'
    ]
  },
  testing: {
    theory: [
      'testing coverage for a critical feature',
      'how unit, integration, and end-to-end tests should be balanced',
      'what makes tests reliable instead of noisy'
    ],
    scenario: [
      'a release with regressions despite having tests in place',
      'a flaky test suite slowing down deployment confidence',
      'a feature area with poor bug detection after launches'
    ],
    practical: [
      'a pragmatic testing strategy for a new feature',
      'a test plan for a risky product change',
      'a maintainable automation approach for frontend and API behavior'
    ]
  },
  api_design: {
    theory: [
      'designing an API that remains easy to evolve',
      'how API shape affects clients, versioning, and long-term maintenance',
      'what makes an API contract consistent and dependable'
    ],
    scenario: [
      'a public API that needs a breaking change without disrupting clients',
      'a backend with inconsistent endpoint behavior across teams',
      'a service contract causing repeated integration bugs'
    ],
    practical: [
      'an API contract for a new product capability',
      'a versioning and migration plan for an existing endpoint',
      'a safe rollout for a backend contract change'
    ]
  },
  database_design: {
    theory: [
      'database schema decisions for a scaling product',
      'how relational structure and indexing affect backend performance',
      'when to denormalize versus keep stricter normalization'
    ],
    scenario: [
      'a product area slowing down because query patterns changed',
      'a data model that became difficult to extend safely',
      'a backend feature where reporting and transactions compete'
    ],
    practical: [
      'a schema for a feature with changing access patterns',
      'an indexing plan for a growing application',
      'a migration path for reshaping production data without downtime'
    ]
  },
  authentication: {
    theory: [
      'authentication and authorization for a new feature',
      'how auth, sessions, and permission boundaries should be modeled',
      'common security mistakes in auth flows'
    ],
    scenario: [
      'a product where users are seeing data outside their role',
      'a login flow with token handling issues in production',
      'a feature launch that introduces more complex permission rules'
    ],
    practical: [
      'an auth design for a role-based application',
      'a secure session model for web and API clients',
      'a rollout plan for adding authorization checks across services'
    ]
  },
  system_design: {
    theory: [
      'service boundaries for a multi-feature platform',
      'how system design choices affect reliability and team velocity',
      'the tradeoffs between monolith and distributed service boundaries'
    ],
    scenario: [
      'a growing platform that is outgrowing its original architecture',
      'a backend system struggling with noisy dependencies under load',
      'a product launch requiring more resilient service boundaries'
    ],
    practical: [
      'a system design for a new high-impact feature',
      'an architecture plan for scaling an existing backend',
      'a staged migration from a simpler backend to a more modular one'
    ]
  },
  scalability: {
    theory: [
      'scaling bottlenecks under rising traffic',
      'how throughput, latency, and resource pressure interact',
      'what practical scalability planning looks like before outages happen'
    ],
    scenario: [
      'traffic growth causing timeouts and degraded user experience',
      'a backend service buckling during predictable peak periods',
      'a queue-backed system falling behind after a traffic spike'
    ],
    practical: [
      'a scaling plan for an API under rapid growth',
      'a mitigation strategy for load-related production incidents',
      'an engineering roadmap for improving capacity safely'
    ]
  },
  security: {
    theory: [
      'security risks in a shipped application',
      'how to think about attack surface in a web product',
      'what secure defaults matter most in day-to-day engineering'
    ],
    scenario: [
      'a feature release that exposed sensitive data unexpectedly',
      'a backend endpoint showing signs of abuse or weak validation',
      'a product team moving quickly without consistent security reviews'
    ],
    practical: [
      'a security review plan for a new feature',
      'a hardening checklist for an API before launch',
      'a remediation rollout after discovering a backend vulnerability'
    ]
  },
  observability: {
    theory: [
      'how to monitor and debug production incidents',
      'what logs, metrics, and traces each contribute during incident response',
      'how observability supports faster backend troubleshooting'
    ],
    scenario: [
      'an incident where the team cannot pinpoint the failing dependency',
      'a backend system with alerts but poor debugging context',
      'a production issue that spans multiple services and queues'
    ],
    practical: [
      'an observability baseline for a growing backend service',
      'an incident response workflow with metrics, logs, and traces',
      'a rollout plan for better monitoring in a noisy production system'
    ]
  }
}

const normalizeScore = (value) => Math.max(0, Math.min(100, Math.round(value)))

const buildQuestionText = ({ role, seniority, topic, style, variantText, emphasis }) => {
  const promptStart = fallbackQuestionStarters[style][seniority]
  const roleLabel = ROLE_BLUEPRINTS[role].label.toLowerCase()
  return `${promptStart} ${variantText} in a ${roleLabel} role? ${emphasis}`
}

const summarizeCorrectness = (entries) =>
  entries.reduce(
    (summary, entry) => {
      if (entry.verdict === 'correct') {
        summary.correctAnswers += 1
      } else if (entry.verdict === 'incorrect') {
        summary.incorrectAnswers += 1
      } else {
        summary.partialAnswers += 1
      }

      return summary
    },
    {
      correctAnswers: 0,
      partialAnswers: 0,
      incorrectAnswers: 0
    }
  )

const evaluateMockAnswer = (turn, index) => {
  const answer = turn.answer?.trim() || ''
  const normalized = answer.toLowerCase()
  const hasStructuredReasoning =
    ['because', 'tradeoff', 'example', 'test', 'debug', 'monitor', 'validate'].some((term) =>
      normalized.includes(term)
    )
  const lengthScore = answer.length > 220 ? 85 : answer.length > 140 ? 72 : answer.length > 70 ? 58 : 36
  const topicMatch = normalized.includes(turn.topic?.split('_')[0] || '') ? 6 : 0
  const reasoningBoost = hasStructuredReasoning ? 10 : 0
  const accuracyScore = normalizeScore(lengthScore + reasoningBoost + topicMatch + (index % 2 === 0 ? 2 : 0))
  const verdict = accuracyScore >= 75 ? 'correct' : accuracyScore >= 50 ? 'partial' : 'incorrect'

  return {
    questionNumber: index + 1,
    topic: turn.topic || 'general',
    question: turn.question,
    answer,
    verdict,
    accuracyScore,
    feedback:
      verdict === 'correct'
        ? 'Strong answer. You covered the main idea and backed it with practical reasoning.'
        : verdict === 'partial'
          ? 'Partly correct. The core direction is reasonable, but the answer needs clearer tradeoffs or validation details.'
          : 'Weak answer. The response is too thin or misses key technical points for this question.'
  }
}

const pickVariantText = ({ topic, style, usedQuestions, role, seniority, emphasis }) => {
  const variants = QUESTION_VARIANTS[topic]?.[style] || [topicLabels[topic] || 'a technical problem in your stack']

  for (const variantText of variants) {
    const candidate = buildQuestionText({ role, seniority, topic, style, variantText, emphasis })
    if (!usedQuestions.has(candidate)) {
      return { variantText, question: candidate }
    }
  }

  const rotatedText = `${variants[0]} from a fresh angle`
  return {
    variantText: rotatedText,
    question: buildQuestionText({ role, seniority, topic, style, variantText: rotatedText, emphasis })
  }
}

export const generateMockQuestion = ({ role, seniority, turns, previousQuestions = [] }) => {
  const style = getQuestionStyle(turns.length)
  const remainingTopics = getRemainingTopics(role, turns)
  const topicPool = remainingTopics.length > 0 ? remainingTopics : ROLE_BLUEPRINTS[role].topics
  const topicIndex = previousQuestions.length % topicPool.length
  const topic = topicPool[topicIndex] || topicPool[0]
  const emphasis =
    remainingTopics.length > 0
      ? `Focus on ${remainingTopics.slice(0, 2).map((item) => topicLabels[item] || item).join(' and ')} next.`
      : 'Build on what the candidate has already discussed.'
  const usedQuestions = new Set([...previousQuestions, ...turns.map((turn) => turn.question)])
  const { question } = pickVariantText({
    topic,
    style,
    usedQuestions,
    role,
    seniority,
    emphasis
  })

  return {
    topic,
    style,
    question
  }
}

export const generateMockEvaluation = ({ role, seniority, turns }) => {
  const transcript = turns.map(evaluateMockAnswer)
  const averageAnswerLength =
    turns.reduce((sum, turn) => sum + (turn.answer?.trim().length || 0), 0) / Math.max(turns.length, 1)
  const coverageRatio = new Set(turns.map((turn) => turn.topic)).size / ROLE_BLUEPRINTS[role].topics.length
  const baseline = categoryDefaultsBySeniority[seniority]
  const answerLengthBoost = averageAnswerLength > 220 ? 10 : averageAnswerLength > 120 ? 5 : 0
  const coverageBoost = coverageRatio > 0.7 ? 8 : coverageRatio > 0.45 ? 4 : 0
  const correctnessSummary = summarizeCorrectness(transcript)
  const transcriptScore =
    transcript.reduce((sum, entry) => sum + entry.accuracyScore, 0) / Math.max(transcript.length, 1)
  const overallScore = normalizeScore((baseline + answerLengthBoost + coverageBoost + transcriptScore) / 2)
  const categoryScores = RUBRIC_CATEGORIES.reduce((scores, category, index) => {
    scores[category] = normalizeScore(overallScore - 6 + index * 2)
    return scores
  }, {})

  return {
    overallScore,
    categoryScores,
    correctnessSummary,
    strengths: [
      `Demonstrated ${role} awareness across ${Math.max(new Set(turns.map((turn) => turn.topic)).size, 1)} topics.`,
      'Maintained a consistent written communication style throughout the interview.'
    ],
    weaknesses: [
      'Some answers can go deeper on tradeoffs, constraints, and verification strategy.',
      'Examples would be stronger with clearer production metrics or failure handling.'
    ],
    tips: [
      'Use a clearer structure in each answer: context, decision, tradeoff, and validation.',
      `Practice ${role === 'fullstack' ? 'switching between UI and API concerns' : 'expanding practical examples for each concept'}.`,
      'Reference debugging steps, monitoring signals, or tests to make answers more concrete.'
    ],
    summary:
      'This mock evaluation was generated locally because the OpenAI API is not configured. Connect an API key for richer adaptive questioning and scoring.',
    transcript
  }
}
