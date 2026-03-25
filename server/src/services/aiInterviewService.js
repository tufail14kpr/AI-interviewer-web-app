import OpenAI from 'openai'
import { env } from '../config/env.js'
import { ApiError } from '../lib/ApiError.js'
import {
  RUBRIC_CATEGORIES,
  ROLE_BLUEPRINTS,
  SENIORITY_PROFILES,
  buildQuestionHistory,
  buildTranscript,
  getQuestionStyle,
  getRemainingTopics,
  hasBlockedKeyword
} from '../lib/interviewBlueprint.js'
import { generateMockEvaluation, generateMockQuestion } from './mockAiService.js'

const openai = env.openAiApiKey ? new OpenAI({ apiKey: env.openAiApiKey }) : null

const ensureAiAvailability = () => {
  if (!openai) {
    if (env.allowMockAi) {
      return false
    }

    throw new ApiError(
      503,
      'OpenAI API is not configured. Set OPENAI_API_KEY or enable development mock mode.',
      'ai_unavailable'
    )
  }

  return true
}

const getOpenAiErrorMeta = (error) => ({
  status: Number(error?.status || 0),
  code: String(error?.code || ''),
  type: String(error?.type || ''),
  message: String(error?.message || '')
})

export const shouldFallbackToMockAi = (error) => {
  if (!env.allowMockAi) {
    return false
  }

  const { status, code, type } = getOpenAiErrorMeta(error)

  if ([408, 409, 429].includes(status) || status >= 500) {
    return true
  }

  return [
    'insufficient_quota',
    'rate_limit_exceeded',
    'api_connection_error',
    'api_timeout_error',
    'server_error'
  ].includes(code || type)
}

const normalizeAiFailure = (error, fallbackMessage) => {
  if (shouldFallbackToMockAi(error)) {
    return null
  }

  const { status, code, type, message } = getOpenAiErrorMeta(error)
  const aiStatus = status || 502

  if (code === 'invalid_api_key' || type === 'invalid_request_error') {
    return new ApiError(502, fallbackMessage, 'ai_request_failed', {
      status: aiStatus,
      type: code || type || 'openai_error'
    })
  }

  if (status === 401 || status === 403) {
    return new ApiError(
      502,
      'OpenAI authentication failed. Check the configured API key and project permissions.',
      'ai_auth_failed',
      {
        status: aiStatus,
        type: code || type || 'openai_error'
      }
    )
  }

  return new ApiError(
    502,
    message || fallbackMessage,
    'ai_request_failed',
    {
      status: aiStatus,
      type: code || type || 'openai_error'
    }
  )
}

const buildFallbackSummary = (reason) =>
  `This interview used the local mock interviewer because OpenAI was temporarily unavailable (${reason}).`

const withMockFallback = async (operation, fallbackFactory, fallbackReason) => {
  try {
    return await operation()
  } catch (error) {
    if (shouldFallbackToMockAi(error)) {
      return fallbackFactory(error)
    }

    throw normalizeAiFailure(error, fallbackReason)
  }
}

const parseStructuredOutput = (response, failureMessage) => {
  if (!response?.output_text) {
    throw new ApiError(502, failureMessage, 'invalid_ai_response')
  }

  try {
    return JSON.parse(response.output_text)
  } catch (_error) {
    throw new ApiError(502, failureMessage, 'invalid_ai_json')
  }
}

const buildQuestionSchema = (role) => ({
  type: 'json_schema',
  name: 'interview_question',
  strict: true,
  description: 'Single role-valid interview question output.',
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['topic', 'style', 'question'],
    properties: {
      topic: {
        type: 'string',
        enum: ROLE_BLUEPRINTS[role].topics
      },
      style: {
        type: 'string',
        enum: ['theory', 'scenario', 'practical']
      },
      question: {
        type: 'string'
      }
    }
  }
})

const buildReportSchema = () => ({
  type: 'json_schema',
  name: 'interview_report',
  strict: true,
  description: 'Scored interview report output.',
  schema: {
    type: 'object',
    additionalProperties: false,
    required: [
      'overallScore',
      'categoryScores',
      'correctnessSummary',
      'strengths',
      'weaknesses',
      'tips',
      'summary',
      'answerAnalysis'
    ],
    properties: {
      overallScore: {
        type: 'integer',
        minimum: 0,
        maximum: 100
      },
      categoryScores: {
        type: 'object',
        additionalProperties: false,
        required: RUBRIC_CATEGORIES,
        properties: RUBRIC_CATEGORIES.reduce((shape, category) => {
          shape[category] = {
            type: 'integer',
            minimum: 0,
            maximum: 100
          }
          return shape
        }, {})
      },
      correctnessSummary: {
        type: 'object',
        additionalProperties: false,
        required: ['correctAnswers', 'partialAnswers', 'incorrectAnswers'],
        properties: {
          correctAnswers: { type: 'integer', minimum: 0 },
          partialAnswers: { type: 'integer', minimum: 0 },
          incorrectAnswers: { type: 'integer', minimum: 0 }
        }
      },
      strengths: {
        type: 'array',
        minItems: 2,
        items: { type: 'string' }
      },
      weaknesses: {
        type: 'array',
        minItems: 2,
        items: { type: 'string' }
      },
      tips: {
        type: 'array',
        minItems: 3,
        items: { type: 'string' }
      },
      summary: {
        type: 'string'
      },
      answerAnalysis: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['questionNumber', 'verdict', 'accuracyScore', 'feedback'],
          properties: {
            questionNumber: {
              type: 'integer',
              minimum: 1
            },
            verdict: {
              type: 'string',
              enum: ['correct', 'partial', 'incorrect']
            },
            accuracyScore: {
              type: 'integer',
              minimum: 0,
              maximum: 100
            },
            feedback: {
              type: 'string'
            }
          }
        }
      }
    }
  }
})

export const generateNextQuestion = async ({
  role,
  seniority,
  turns,
  targetQuestionCount,
  previousQuestions = []
}) => {
  const aiEnabled = ensureAiAvailability()
  if (!aiEnabled) {
    return generateMockQuestion({ role, seniority, turns, targetQuestionCount, previousQuestions })
  }

  const roleBlueprint = ROLE_BLUEPRINTS[role]
  const seniorityProfile = SENIORITY_PROFILES[seniority]
  const questionNumber = turns.length + 1
  const remainingTopics = getRemainingTopics(role, turns)
  const expectedStyle = getQuestionStyle(turns.length)

  return withMockFallback(
    async () => {
      const response = await openai.responses.create({
        model: env.openAiModel,
        input: [
          {
            role: 'developer',
            content: [
              {
                type: 'input_text',
                text:
                  'You are an exacting technical interviewer. Produce exactly one next interview question as JSON. Never ask more than one question. Never include an answer, explanation, rubric, or markdown.'
              }
            ]
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: [
                  `Interview role: ${roleBlueprint.label}`,
                  `Seniority: ${seniorityProfile.label}`,
                  `Question number: ${questionNumber} of ${targetQuestionCount}`,
                  `Required style for this turn: ${expectedStyle}`,
                  `Allowed topics: ${roleBlueprint.topics.join(', ')}`,
                  `Remaining uncovered topics: ${remainingTopics.join(', ') || 'none'}`,
                  `Previously asked questions to avoid repeating: ${previousQuestions.join(' || ') || 'none'}`,
                  `Role guidance: ${roleBlueprint.guidance}`,
                  `Seniority guidance: ${seniorityProfile.guidance}`,
                  'The interview style should balance theory, scenario, and practical discussion.',
                  'Do not repeat or lightly paraphrase any previously asked question from earlier sessions.',
                  'Use the prior transcript to avoid repetition and build naturally on prior answers.',
                  `Transcript so far:\n${buildQuestionHistory(turns) || 'No prior turns.'}`
                ].join('\n')
              }
            ]
          }
        ],
        text: {
          format: buildQuestionSchema(role)
        }
      })

      const payload = parseStructuredOutput(response, 'Failed to generate the next interview question.')

      if (hasBlockedKeyword(role, payload.question)) {
        throw new ApiError(
          502,
          'The generated interview question did not match the selected role. Retry generation.',
          'role_mismatch'
        )
      }

      return payload
    },
    () => generateMockQuestion({ role, seniority, turns, targetQuestionCount, previousQuestions }),
    'Failed to generate the next interview question.'
  )
}

export const evaluateInterview = async ({ role, seniority, turns }) => {
  const aiEnabled = ensureAiAvailability()
  if (!aiEnabled) {
    return generateMockEvaluation({ role, seniority, turns })
  }

  const roleBlueprint = ROLE_BLUEPRINTS[role]
  const seniorityProfile = SENIORITY_PROFILES[seniority]
  const transcript = buildTranscript(turns)

  return withMockFallback(
    async () => {
      const response = await openai.responses.create({
        model: env.openAiModel,
        input: [
          {
            role: 'developer',
            content: [
              {
                type: 'input_text',
                text:
                  'You are a fair but demanding technical interview evaluator. Produce a concise JSON report. Score for the selected role and seniority only. Use all rubric categories, include correct/partial/incorrect answer counts, and return per-question verdicts grounded in the transcript.'
              }
            ]
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: JSON.stringify(
                  {
                    role: roleBlueprint.label,
                    seniority: seniorityProfile.label,
                    rubric: RUBRIC_CATEGORIES,
                    expectations: [
                      roleBlueprint.guidance,
                      seniorityProfile.guidance,
                      'Assess technical accuracy, depth, problem solving, clarity, and role alignment.',
                      'Return balanced strengths, weaknesses, and actionable improvement tips.'
                    ],
                    transcript
                  },
                  null,
                  2
                )
              }
            ]
          }
        ],
        text: {
          format: buildReportSchema()
        }
      })

      const payload = parseStructuredOutput(response, 'Failed to evaluate the completed interview.')
      const transcriptWithAnalysis = transcript.map((entry) => {
        const analysis = payload.answerAnalysis.find((item) => item.questionNumber === entry.questionNumber)
        return {
          ...entry,
          verdict: analysis?.verdict || 'partial',
          accuracyScore: analysis?.accuracyScore ?? 50,
          feedback: analysis?.feedback || ''
        }
      })

      return {
        ...payload,
        transcript: transcriptWithAnalysis
      }
    },
    (error) => {
      const { code, type, status } = getOpenAiErrorMeta(error)
      const reason = code || type || `status ${status || 502}`
      return {
        ...generateMockEvaluation({ role, seniority, turns }),
        summary: buildFallbackSummary(reason)
      }
    },
    'Failed to evaluate the completed interview.'
  )
}
