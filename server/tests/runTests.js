import assert from 'node:assert/strict'
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

console.log('All interview blueprint tests passed.')
