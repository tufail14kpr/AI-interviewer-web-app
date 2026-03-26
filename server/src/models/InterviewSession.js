import mongoose from 'mongoose'
import { ROLE_BLUEPRINTS, RUBRIC_CATEGORIES, SENIORITY_PROFILES } from '../lib/interviewBlueprint.js'

const questionTurnSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: true
    },
    style: {
      type: String,
      enum: ['theory', 'scenario', 'practical'],
      required: true
    },
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      default: ''
    },
    askedAt: {
      type: Date,
      default: Date.now
    },
    answeredAt: Date
  },
  { _id: false }
)

const transcriptEntrySchema = new mongoose.Schema(
  {
    questionNumber: Number,
    topic: String,
    question: String,
    answer: String,
    verdict: {
      type: String,
      enum: ['correct', 'partial', 'incorrect'],
      default: 'partial'
    },
    accuracyScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 50
    },
    feedback: {
      type: String,
      default: ''
    },
    idealAnswer: {
      type: String,
      default: ''
    }
  },
  { _id: false }
)

const categoryScoreSchema = new mongoose.Schema(
  RUBRIC_CATEGORIES.reduce((shape, category) => {
    shape[category] = { type: Number, required: true }
    return shape
  }, {}),
  { _id: false }
)

const evaluationReportSchema = new mongoose.Schema(
  {
    overallScore: {
      type: Number,
      required: true
    },
    categoryScores: {
      type: categoryScoreSchema,
      required: true
    },
    strengths: {
      type: [String],
      default: []
    },
    weaknesses: {
      type: [String],
      default: []
    },
    tips: {
      type: [String],
      default: []
    },
    summary: {
      type: String,
      default: ''
    },
    correctnessSummary: {
      type: new mongoose.Schema(
        {
          correctAnswers: { type: Number, default: 0 },
          partialAnswers: { type: Number, default: 0 },
          incorrectAnswers: { type: Number, default: 0 }
        },
        { _id: false }
      ),
      default: () => ({
        correctAnswers: 0,
        partialAnswers: 0,
        incorrectAnswers: 0
      })
    },
    transcript: {
      type: [transcriptEntrySchema],
      default: []
    },
    generatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
)

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    role: {
      type: String,
      enum: Object.keys(ROLE_BLUEPRINTS),
      required: true
    },
    seniority: {
      type: String,
      enum: Object.keys(SENIORITY_PROFILES),
      required: true
    },
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active'
    },
    targetQuestionCount: {
      type: Number,
      min: 20,
      max: 25,
      required: true
    },
    generationState: {
      pendingNextQuestion: {
        type: Boolean,
        default: false
      },
      retryableMessage: {
        type: String,
        default: ''
      }
    },
    turns: {
      type: [questionTurnSchema],
      default: []
    },
    report: evaluationReportSchema,
    completedAt: Date
  },
  {
    timestamps: true
  }
)

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema)

export default InterviewSession
