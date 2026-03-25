import bcrypt from 'bcryptjs'
import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { env } from '../config/env.js'
import { asyncHandler } from '../lib/asyncHandler.js'
import { ApiError } from '../lib/ApiError.js'
import { serializeUser } from '../lib/serializers.js'
import { assertDisplayName, assertStrongPassword, assertValidEmail } from '../lib/validators.js'

const router = express.Router()

const buildToken = (userId) =>
  jwt.sign(
    {
      userId
    },
    env.jwtSecret,
    {
      expiresIn: '7d'
    }
  )

router.post(
  '/signup',
  asyncHandler(async (request, response) => {
    const name = assertDisplayName(request.body.name)
    const email = assertValidEmail(request.body.email)
    const password = assertStrongPassword(request.body.password)

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      throw new ApiError(409, 'An account with this email already exists.', 'email_in_use')
    }

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({
      name,
      email,
      passwordHash
    })

    response.status(201).json({
      token: buildToken(user._id.toString()),
      user: serializeUser(user)
    })
  })
)

router.post(
  '/login',
  asyncHandler(async (request, response) => {
    const email = assertValidEmail(request.body.email)
    const password = String(request.body.password || '')
    const user = await User.findOne({ email })

    if (!user) {
      throw new ApiError(401, 'Invalid email or password.', 'invalid_credentials')
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    if (!isValidPassword) {
      throw new ApiError(401, 'Invalid email or password.', 'invalid_credentials')
    }

    response.json({
      token: buildToken(user._id.toString()),
      user: serializeUser(user)
    })
  })
)

export default router

