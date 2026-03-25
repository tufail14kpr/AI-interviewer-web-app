import express from 'express'
import InterviewSession from '../models/InterviewSession.js'
import { asyncHandler } from '../lib/asyncHandler.js'
import { ApiError } from '../lib/ApiError.js'
import { serializeReport } from '../lib/serializers.js'

const router = express.Router()

router.get(
  '/:sessionId',
  asyncHandler(async (request, response) => {
    const session = await InterviewSession.findOne({
      _id: request.params.sessionId,
      userId: request.user._id
    })

    if (!session) {
      throw new ApiError(404, 'Interview report not found.', 'report_not_found')
    }

    if (!session.report) {
      throw new ApiError(409, 'This interview has not been completed yet.', 'report_pending')
    }

    response.json({
      report: serializeReport(session)
    })
  })
)

export default router

