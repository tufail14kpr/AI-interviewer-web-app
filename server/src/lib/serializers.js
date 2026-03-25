import {
  buildTranscript,
  estimateRemainingQuestions,
  summarizeCoverage
} from './interviewBlueprint.js'

export const serializeUser = (user) => ({
  id: user._id?.toString() || user.id,
  name: user.name,
  email: user.email
})

export const serializeSessionSummary = (session) => ({
  id: session._id?.toString() || session.id,
  role: session.role,
  seniority: session.seniority,
  status: session.status,
  targetQuestionCount: session.targetQuestionCount,
  totalQuestionsAsked: session.turns.length,
  answeredQuestions: session.turns.filter((turn) => turn.answer?.trim()).length,
  remainingEstimated: estimateRemainingQuestions(session),
  overallScore: session.report?.overallScore ?? null,
  createdAt: session.createdAt,
  completedAt: session.completedAt || null
})

export const serializeSession = (session) => {
  const pendingTurnIndex = session.turns.findIndex((turn) => !turn.answer?.trim())
  const currentTurn = pendingTurnIndex === -1 ? null : session.turns[pendingTurnIndex]

  return {
    id: session._id?.toString() || session.id,
    role: session.role,
    seniority: session.seniority,
    status: session.status,
    targetQuestionCount: session.targetQuestionCount,
    totalQuestionsAsked: session.turns.length,
    answeredQuestions: session.turns.filter((turn) => turn.answer?.trim()).length,
    remainingEstimated: estimateRemainingQuestions(session),
    currentQuestion: currentTurn
      ? {
          question: currentTurn.question,
          topic: currentTurn.topic,
          questionNumber: pendingTurnIndex + 1,
          status: session.status
        }
      : null,
    coverage: summarizeCoverage(session.role, session.turns),
    generationState: session.generationState,
    turns: buildTranscript(session.turns),
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    completedAt: session.completedAt || null,
    reportPreview: session.report
      ? {
          overallScore: session.report.overallScore,
          summary: session.report.summary
        }
      : null
  }
}

export const serializeReport = (session) => ({
  sessionId: session._id?.toString() || session.id,
  role: session.role,
  seniority: session.seniority,
  overallScore: session.report?.overallScore ?? 0,
  categoryScores: session.report?.categoryScores || {},
  strengths: session.report?.strengths || [],
  weaknesses: session.report?.weaknesses || [],
  tips: session.report?.tips || [],
  summary: session.report?.summary || '',
  transcript: session.report?.transcript || buildTranscript(session.turns),
  completedAt: session.completedAt || null
})
