import {
  buildTranscript,
  estimateRemainingQuestions,
  summarizeCoverage
} from './interviewBlueprint.js'

export const serializeUser = (user) => ({
  id: user._id?.toString() || user.id,
  name: user.name,
  email: user.email,
  role: user.role || 'candidate'
})

const serializeSessionOwner = (owner) => {
  if (!owner || typeof owner !== 'object' || !('email' in owner)) {
    return null
  }

  return serializeUser(owner)
}

const normalizeReportTranscript = (session) => {
  const baseTranscript = session.report?.transcript || buildTranscript(session.turns)

  return baseTranscript.map((entry, index) => ({
    questionNumber: entry.questionNumber ?? index + 1,
    topic: entry.topic || 'general',
    question: entry.question || '',
    answer: entry.answer || '',
    verdict: entry.verdict || 'partial',
    accuracyScore:
      entry.accuracyScore ?? (entry.verdict === 'correct' ? 85 : entry.verdict === 'incorrect' ? 35 : 60),
    feedback:
      entry.feedback ||
      'Detailed per-question grading is available on newly completed interviews. This older report was normalized for display.',
    idealAnswer: entry.idealAnswer || ''
  }))
}

const summarizeCorrectness = (transcript) =>
  transcript.reduce(
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

export const serializeSessionSummary = (session) => ({
  id: session._id?.toString() || session.id,
  role: session.role,
  seniority: session.seniority,
  user: serializeSessionOwner(session.userId),
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
    user: serializeSessionOwner(session.userId),
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

export const serializeReport = (session) => {
  const transcript = normalizeReportTranscript(session)

  return {
    sessionId: session._id?.toString() || session.id,
    role: session.role,
    seniority: session.seniority,
    user: serializeSessionOwner(session.userId),
    overallScore: session.report?.overallScore ?? 0,
    categoryScores: session.report?.categoryScores || {},
    correctnessSummary: session.report?.correctnessSummary || summarizeCorrectness(transcript),
    strengths: session.report?.strengths || [],
    weaknesses: session.report?.weaknesses || [],
    tips: session.report?.tips || [],
    summary: session.report?.summary || '',
    transcript,
    completedAt: session.completedAt || null
  }
}
