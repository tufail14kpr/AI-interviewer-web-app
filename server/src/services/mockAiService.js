import {
  RUBRIC_CATEGORIES,
  ROLE_BLUEPRINTS,
  buildTranscript,
  getFallbackTopic,
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

const normalizeScore = (value) => Math.max(0, Math.min(100, Math.round(value)))

export const generateMockQuestion = ({ role, seniority, turns }) => {
  const style = getQuestionStyle(turns.length)
  const topic = getFallbackTopic(role, turns)
  const promptStart = fallbackQuestionStarters[style][seniority]
  const topicText = topicLabels[topic] || 'a technical problem in your stack'
  const roleLabel = ROLE_BLUEPRINTS[role].label.toLowerCase()
  const remainingTopics = getRemainingTopics(role, turns)
  const emphasis =
    remainingTopics.length > 0
      ? `Focus on ${remainingTopics.slice(0, 2).map((item) => topicLabels[item] || item).join(' and ')} next.`
      : 'Build on what the candidate has already discussed.'

  return {
    topic,
    style,
    question: `${promptStart} ${topicText} in a ${roleLabel} role? ${emphasis}`
  }
}

export const generateMockEvaluation = ({ role, seniority, turns }) => {
  const transcript = buildTranscript(turns)
  const averageAnswerLength =
    turns.reduce((sum, turn) => sum + (turn.answer?.trim().length || 0), 0) / Math.max(turns.length, 1)
  const coverageRatio = new Set(turns.map((turn) => turn.topic)).size / ROLE_BLUEPRINTS[role].topics.length
  const baseline = categoryDefaultsBySeniority[seniority]
  const answerLengthBoost = averageAnswerLength > 220 ? 10 : averageAnswerLength > 120 ? 5 : 0
  const coverageBoost = coverageRatio > 0.7 ? 8 : coverageRatio > 0.45 ? 4 : 0
  const overallScore = normalizeScore(baseline + answerLengthBoost + coverageBoost)
  const categoryScores = RUBRIC_CATEGORIES.reduce((scores, category, index) => {
    scores[category] = normalizeScore(overallScore - 6 + index * 2)
    return scores
  }, {})

  return {
    overallScore,
    categoryScores,
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

