import express from 'express'
import InterviewSession from '../models/InterviewSession.js'
import { asyncHandler } from '../lib/asyncHandler.js'
import { ApiError } from '../lib/ApiError.js'
import {
  estimateRemainingQuestions,
  getQuestionStyle,
  pickTargetQuestionCount
} from '../lib/interviewBlueprint.js'
import { serializeSession, serializeSessionSummary } from '../lib/serializers.js'
import { assertAnswer, assertRole, assertSeniority } from '../lib/validators.js'
import { evaluateInterview, generateNextQuestion } from '../services/aiInterviewService.js'

const router = express.Router()

const findUserSession = async (sessionId, userId) => {
  const session = await InterviewSession.findOne({ _id: sessionId, userId })
  if (!session) {
    throw new ApiError(404, 'Interview session not found.', 'session_not_found')
  }

  return session
}

const ensureActiveSession = (session) => {
  if (session.status !== 'active') {
    throw new ApiError(409, 'This interview session is already completed.', 'session_completed')
  }
}

router.get(
  '/',
  asyncHandler(async (request, response) => {
    const sessions = await InterviewSession.find({ userId: request.user._id }).sort({ createdAt: -1 })

    response.json({
      sessions: sessions.map(serializeSessionSummary)
    })
  })
)

router.post(
  '/',
  asyncHandler(async (request, response) => {
    const role = assertRole(request.body.role)
    const seniority = assertSeniority(request.body.seniority)
    const targetQuestionCount = pickTargetQuestionCount(role, seniority)
    const openingQuestion = await generateNextQuestion({
      role,
      seniority,
      turns: [],
      targetQuestionCount
    })

    const session = await InterviewSession.create({
      userId: request.user._id,
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

    response.status(201).json({
      session: serializeSession(session)
    })
  })
)

router.get(
  '/:id',
  asyncHandler(async (request, response) => {
    const session = await findUserSession(request.params.id, request.user._id)
    response.json({
      session: serializeSession(session)
    })
  })
)

router.post(
  '/:id/answer',
  asyncHandler(async (request, response) => {
    const session = await findUserSession(request.params.id, request.user._id)
    ensureActiveSession(session)

    const currentTurn = session.turns.find((turn) => !turn.answer?.trim())
    if (!currentTurn) {
      throw new ApiError(
        409,
        'There is no pending question to answer. Complete the interview or refresh the session.',
        'no_pending_question'
      )
    }

    currentTurn.answer = assertAnswer(request.body.answer)
    currentTurn.answeredAt = new Date()
    session.generationState.pendingNextQuestion = false
    session.generationState.retryableMessage = ''

    const reachedTarget = session.turns.length >= session.targetQuestionCount
    if (reachedTarget) {
      await session.save()
      response.json({
        status: 'ready_for_completion',
        remainingEstimated: 0,
        session: serializeSession(session)
      })
      return
    }

    try {
      const nextQuestion = await generateNextQuestion({
        role: session.role,
        seniority: session.seniority,
        turns: session.turns,
        targetQuestionCount: session.targetQuestionCount
      })

      session.turns.push({
        topic: nextQuestion.topic,
        style: nextQuestion.style || getQuestionStyle(session.turns.length),
        question: nextQuestion.question
      })

      await session.save()

      response.json({
        status: 'active',
        question: nextQuestion.question,
        questionNumber: session.turns.length,
        remainingEstimated: estimateRemainingQuestions(session),
        session: serializeSession(session)
      })
    } catch (error) {
      session.generationState.pendingNextQuestion = true
      session.generationState.retryableMessage =
        'Your answer was saved, but the next question could not be generated. Retry by reloading the interview.'
      await session.save()

      throw error
    }
  })
)

router.post(
  '/:id/complete',
  asyncHandler(async (request, response) => {
    const session = await findUserSession(request.params.id, request.user._id)

    if (session.status === 'completed') {
      response.json({
        report: session.report,
        session: serializeSession(session)
      })
      return
    }

    const pendingTurn = session.turns.find((turn) => !turn.answer?.trim())
    if (pendingTurn) {
      throw new ApiError(409, 'Answer the current question before completing the interview.', 'pending_answer')
    }

    const report = await evaluateInterview({
      role: session.role,
      seniority: session.seniority,
      turns: session.turns
    })

    session.status = 'completed'
    session.completedAt = new Date()
    session.report = report
    session.generationState.pendingNextQuestion = false
    session.generationState.retryableMessage = ''
    await session.save()

    response.json({
      session: serializeSession(session),
      report
    })
  })
)

export default router

