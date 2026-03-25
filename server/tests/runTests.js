import assert from 'node:assert/strict'
import { shouldFallbackToMockAi } from '../src/services/aiInterviewService.js'
import { generateMockEvaluation, generateMockQuestion } from '../src/services/mockAiService.js'
import {
  ROLE_BLUEPRINTS,
  estimateRemainingQuestions,
  getFallbackTopic,
  getQuestionStyle,
  getRemainingTopics,
  hasBlockedKeyword,
  pickTargetQuestionCount
} from '../src/lib/interviewBlueprint.js'

const run = (name, callback) => {
  callback()
  console.log(`PASS ${name}`)
}

run('target question counts stay within 20-25 and fullstack is broader', () => {
  assert.equal(pickTargetQuestionCount('frontend', 'junior'), 20)
  assert.equal(pickTargetQuestionCount('backend', 'senior'), 22)
  assert.equal(pickTargetQuestionCount('fullstack', 'senior'), 25)
})

run('remaining topics shrink as turns cover a role', () => {
  const turns = [{ topic: 'html_semantics' }, { topic: 'css_layout' }]
  const remaining = getRemainingTopics('frontend', turns)

  assert.ok(!remaining.includes('html_semantics'))
  assert.ok(!remaining.includes('css_layout'))
  assert.ok(remaining.includes('react_state'))
})

run('fallback topics prioritize uncovered role topics', () => {
  const turns = ROLE_BLUEPRINTS.backend.topics.slice(0, 2).map((topic) => ({ topic }))
  assert.equal(getFallbackTopic('backend', turns), ROLE_BLUEPRINTS.backend.topics[2])
})

run('question style rotates through theory, scenario, and practical', () => {
  assert.equal(getQuestionStyle(0), 'theory')
  assert.equal(getQuestionStyle(1), 'scenario')
  assert.equal(getQuestionStyle(2), 'practical')
  assert.equal(getQuestionStyle(3), 'theory')
})

run('remaining estimate never drops below zero', () => {
  const remaining = estimateRemainingQuestions([{ topic: 'x' }], 1)
  assert.equal(remaining, 0)
})

run('frontend and backend role guardrails detect blocked keywords', () => {
  assert.equal(hasBlockedKeyword('frontend', 'How would you handle database sharding for growth?'), true)
  assert.equal(hasBlockedKeyword('backend', 'Explain React hooks and CSS Grid tradeoffs.'), true)
  assert.equal(hasBlockedKeyword('fullstack', 'Compare React and API design concerns.'), false)
})

run('OpenAI quota and transient failures fall back to mock mode', () => {
  assert.equal(shouldFallbackToMockAi({ status: 429, code: 'insufficient_quota' }), true)
  assert.equal(shouldFallbackToMockAi({ status: 503, type: 'server_error' }), true)
  assert.equal(shouldFallbackToMockAi({ status: 401, code: 'invalid_api_key' }), false)
})

run('mock generator avoids exact previous-session question repeats', () => {
  const firstQuestion = generateMockQuestion({
    role: 'frontend',
    seniority: 'junior',
    turns: [],
    previousQuestions: []
  })
  const secondQuestion = generateMockQuestion({
    role: 'frontend',
    seniority: 'junior',
    turns: [],
    previousQuestions: [firstQuestion.question]
  })

  assert.notEqual(firstQuestion.question, secondQuestion.question)
})

run('mock evaluation returns correct, partial, and incorrect counts', () => {
  const report = generateMockEvaluation({
    role: 'frontend',
    seniority: 'junior',
    turns: [
      {
        topic: 'html_semantics',
        question: 'Explain semantic HTML.',
        answer:
          'I would use semantic landmarks because they help accessibility, structure, and testing. I would validate the flow with screen reader checks and browser testing.'
      },
      {
        topic: 'performance',
        question: 'How would you improve page speed?',
        answer: 'Make it faster.'
      }
    ]
  })

  const totalReviewed =
    report.correctnessSummary.correctAnswers +
    report.correctnessSummary.partialAnswers +
    report.correctnessSummary.incorrectAnswers

  assert.equal(totalReviewed, 2)
  assert.equal(report.transcript.length, 2)
  assert.ok(report.transcript.every((entry) => typeof entry.feedback === 'string' && entry.feedback.length > 0))
})

console.log('All interview blueprint tests passed.')
