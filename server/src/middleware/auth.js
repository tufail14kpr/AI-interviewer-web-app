import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { env } from '../config/env.js'
import { ApiError } from '../lib/ApiError.js'
import { isAdminUser, resolveUserRole } from '../lib/userRoles.js'

export const requireAuth = async (request, _response, next) => {
  try {
    const header = request.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : ''

    if (!token) {
      throw new ApiError(401, 'Authentication is required.', 'missing_token')
    }

    const payload = jwt.verify(token, env.jwtSecret)
    const user = await User.findById(payload.userId)

    if (!user) {
      throw new ApiError(401, 'User session is no longer valid.', 'invalid_session')
    }

    const resolvedRole = resolveUserRole(user.email, user.role)
    if (resolvedRole !== user.role) {
      user.role = resolvedRole
      await user.save()
    }

    request.user = user
    next()
  } catch (error) {
    next(error)
  }
}

export const requireAdmin = (request, _response, next) => {
  if (!isAdminUser(request.user)) {
    next(new ApiError(403, 'Admin access is required.', 'admin_required'))
    return
  }

  next()
}
