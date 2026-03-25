export const RUBRIC_CATEGORIES = [
  'technicalAccuracy',
  'depthOfUnderstanding',
  'problemSolving',
  'communicationClarity',
  'roleAlignment'
]

export const SENIORITY_PROFILES = {
  junior: {
    label: 'Junior',
    guidance:
      'Ask foundational questions with practical examples and moderate depth. Reward clarity, correct fundamentals, and basic tradeoff awareness.'
  },
  mid: {
    label: 'Mid',
    guidance:
      'Ask implementation and debugging questions with stronger tradeoff analysis. Expect independent reasoning and production awareness.'
  },
  senior: {
    label: 'Senior',
    guidance:
      'Ask system-level design and leadership-oriented technical questions. Expect rigorous tradeoffs, scalability thinking, and clear prioritization.'
  }
}

export const ROLE_BLUEPRINTS = {
  frontend: {
    label: 'Frontend',
    questionBands: {
      theory: 'Core browser, language, and framework knowledge',
      scenario: 'Debugging and product-facing implementation tradeoffs',
      practical: 'Architecture, performance, testing, accessibility, and UI delivery'
    },
    topics: [
      'html_semantics',
      'css_layout',
      'javascript_fundamentals',
      'typescript',
      'react_state',
      'component_architecture',
      'performance',
      'accessibility',
      'testing'
    ],
    blockedKeywords: [
      'database sharding',
      'sql query optimization',
      'orm migration',
      'queue consumer',
      'kafka partition',
      'microservice boundary'
    ],
    guidance:
      'Stay within frontend engineering. Focus on browser behavior, UI architecture, component design, rendering performance, accessibility, testing, and product delivery. Do not ask backend-only, data-pipeline, or infrastructure questions.',
    targetCounts: {
      junior: 20,
      mid: 21,
      senior: 22
    }
  },
  backend: {
    label: 'Backend',
    questionBands: {
      theory: 'Server-side architecture, data, and API fundamentals',
      scenario: 'Scalability, reliability, debugging, and security tradeoffs',
      practical: 'Schema design, caching, auth, observability, and service decomposition'
    },
    topics: [
      'api_design',
      'database_design',
      'authentication',
      'system_design',
      'performance',
      'scalability',
      'security',
      'testing',
      'observability'
    ],
    blockedKeywords: [
      'css grid',
      'flexbox',
      'react hooks',
      'dom event',
      'component props',
      'responsive layout'
    ],
    guidance:
      'Stay within backend engineering. Focus on APIs, persistence, auth, reliability, scalability, observability, and server-side tradeoffs. Do not ask frontend-only layout, browser, or UI framework questions.',
    targetCounts: {
      junior: 20,
      mid: 21,
      senior: 22
    }
  },
  fullstack: {
    label: 'Fullstack',
    questionBands: {
      theory: 'Balanced frontend and backend fundamentals',
      scenario: 'Cross-layer tradeoffs, product architecture, and debugging',
      practical: 'End-to-end implementation, performance, testing, and delivery'
    },
    topics: [
      'html_semantics',
      'css_layout',
      'javascript_fundamentals',
      'typescript',
      'react_state',
      'component_architecture',
      'api_design',
      'database_design',
      'authentication',
      'system_design',
      'performance',
      'scalability',
      'security',
      'testing'
    ],
    blockedKeywords: [],
    guidance:
      'Balance frontend and backend coverage. Ensure the interview spans UI implementation, APIs, data, auth, performance, and architecture. Keep the session mixed rather than backend-heavy or frontend-heavy.',
    targetCounts: {
      junior: 23,
      mid: 24,
      senior: 25
    }
  }
}

export const QUESTION_STYLES = ['theory', 'scenario', 'practical']

export const getRoleBlueprint = (role) => ROLE_BLUEPRINTS[role]

export const isValidRole = (role) => Object.hasOwn(ROLE_BLUEPRINTS, role)

export const isValidSeniority = (seniority) => Object.hasOwn(SENIORITY_PROFILES, seniority)

export const pickTargetQuestionCount = (role, seniority) => {
  const blueprint = getRoleBlueprint(role)
  return blueprint?.targetCounts?.[seniority] || 20
}

export const getCoveredTopics = (turns = []) =>
  turns.map((turn) => turn.topic).filter(Boolean)

export const getRemainingTopics = (role, turns = []) => {
  const blueprint = getRoleBlueprint(role)
  if (!blueprint) {
    return []
  }

  const seen = new Set(getCoveredTopics(turns))
  return blueprint.topics.filter((topic) => !seen.has(topic))
}

export const getQuestionStyle = (turnIndex) => QUESTION_STYLES[turnIndex % QUESTION_STYLES.length]

export const getFallbackTopic = (role, turns = []) => {
  const remaining = getRemainingTopics(role, turns)
  if (remaining.length > 0) {
    return remaining[0]
  }

  const blueprint = getRoleBlueprint(role)
  return blueprint?.topics?.[turns.length % blueprint.topics.length] || 'general'
}

export const estimateRemainingQuestions = (sessionOrTurns, targetQuestionCount) => {
  const turns = Array.isArray(sessionOrTurns) ? sessionOrTurns : sessionOrTurns.turns || []
  const target = targetQuestionCount || sessionOrTurns.targetQuestionCount || 20
  return Math.max(target - turns.length, 0)
}

export const buildTranscript = (turns = []) =>
  turns.map((turn, index) => ({
    questionNumber: index + 1,
    topic: turn.topic || 'general',
    question: turn.question,
    answer: turn.answer || '',
    verdict: turn.verdict || 'partial',
    accuracyScore: turn.accuracyScore ?? 50,
    feedback: turn.feedback || ''
  }))

export const summarizeCoverage = (role, turns = []) => {
  const blueprint = getRoleBlueprint(role)
  const covered = new Set(getCoveredTopics(turns))

  return blueprint.topics.map((topic) => ({
    topic,
    covered: covered.has(topic)
  }))
}

export const hasBlockedKeyword = (role, question = '') => {
  const normalizedQuestion = question.toLowerCase()
  const blockedKeywords = getRoleBlueprint(role)?.blockedKeywords || []
  return blockedKeywords.some((keyword) => normalizedQuestion.includes(keyword))
}

export const buildQuestionHistory = (turns = []) =>
  turns
    .map((turn, index) => {
      const safeAnswer = turn.answer?.trim() || 'No answer yet.'
      return `Q${index + 1} [${turn.topic || 'general'}]: ${turn.question}\nA${index + 1}: ${safeAnswer}`
    })
    .join('\n\n')
