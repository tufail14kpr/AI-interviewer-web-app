import express from 'express'
import InterviewSession from '../models/InterviewSession.js'
import User from '../models/User.js'
import { asyncHandler } from '../lib/asyncHandler.js'
import { ApiError } from '../lib/ApiError.js'
import { serializeReport, serializeSession, serializeSessionSummary, serializeUser } from '../lib/serializers.js'
import { assertRole, assertSeniority } from '../lib/validators.js'
import { getQuestionStyle, pickTargetQuestionCount } from '../lib/interviewBlueprint.js'
import { generateNextQuestion } from '../services/aiInterviewService.js'

const router = express.Router()

const loadPreviousQuestions = async ({ userId, role, excludeSessionId }) => {
  const query = {
    userId,
    role
  }

  if (excludeSessionId) {
    query._id = { $ne: excludeSessionId }
  }

  const sessions = await InterviewSession.find(query)
    .sort({ createdAt: -1 })
    .limit(12)
    .select('turns.question')

  return sessions
    .flatMap((session) => session.turns.map((turn) => turn.question).filter(Boolean))
    .slice(0, 40)
}

router.get(
  '/overview',
  asyncHandler(async (_request, response) => {
    const [users, sessions] = await Promise.all([
      User.find().sort({ createdAt: -1 }),
      InterviewSession.find().populate('userId').sort({ createdAt: -1 }).limit(100)
    ])

    response.json({
      stats: {
        totalUsers: users.filter((user) => user.role !== 'admin').length,
        totalInterviews: sessions.length,
        completedReports: sessions.filter((session) => session.status === 'completed').length,
        activeInterviews: sessions.filter((session) => session.status === 'active').length
      },
      users: users.filter((user) => user.role !== 'admin').map(serializeUser),
      interviews: sessions.map(serializeSessionSummary)
    })
  })
)

router.post(
  '/interviews',
  asyncHandler(async (request, response) => {
    const user = await User.findById(request.body.userId)
    if (!user || user.role === 'admin') {
      throw new ApiError(404, 'Candidate user not found.', 'user_not_found')
    }

    const role = assertRole(request.body.role)
    const seniority = assertSeniority(request.body.seniority)
    const targetQuestionCount = pickTargetQuestionCount(role, seniority)
    const previousQuestions = await loadPreviousQuestions({
      userId: user._id,
      role
    })
    const openingQuestion = await generateNextQuestion({
      role,
      seniority,
      turns: [],
      targetQuestionCount,
      previousQuestions
    })

    const session = await InterviewSession.create({
      userId: user._id,
      role,
      seniority,
      targetQuestionCount,
      turns: [
        {
          topic: openingQuestion.topic,
          style: openingQuestion.style || getQuestionStyle(0),
          question: openingQuestion.question
        }
      ]
    })

    await session.populate('userId')

    response.status(201).json({
      session: serializeSession(session)
    })
  })
)

router.get(
  '/interviews/:id',
  asyncHandler(async (request, response) => {
    const session = await InterviewSession.findById(request.params.id).populate('userId')

    if (!session) {
      throw new ApiError(404, 'Interview session not found.', 'session_not_found')
    }

    response.json({
      session: serializeSession(session),
      report: session.report ? serializeReport(session) : null
    })
  })
)

export default router
