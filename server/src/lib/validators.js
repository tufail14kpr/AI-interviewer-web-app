import { ApiError } from './ApiError.js'
import { isValidRole, isValidSeniority } from './interviewBlueprint.js'

export const assertValidEmail = (email) => {
  const normalized = String(email || '').trim().toLowerCase()
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailPattern.test(normalized)) {
    throw new ApiError(400, 'A valid email address is required.', 'invalid_email')
  }

  return normalized
}

export const assertStrongPassword = (password) => {
  const value = String(password || '')
  if (value.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters long.', 'weak_password')
  }

  return value
}

export const assertDisplayName = (name) => {
  const value = String(name || '').trim()
  if (value.length < 2) {
    throw new ApiError(400, 'Name must be at least 2 characters long.', 'invalid_name')
  }

  return value
}

export const assertRole = (role) => {
  if (!isValidRole(role)) {
    throw new ApiError(400, 'Role must be frontend, backend, or fullstack.', 'invalid_role')
  }

  return role
}

export const assertSeniority = (seniority) => {
  if (!isValidSeniority(seniority)) {
    throw new ApiError(400, 'Seniority must be junior, mid, or senior.', 'invalid_seniority')
  }

  return seniority
}

export const assertAnswer = (answer) => {
  const value = String(answer || '').trim()
  if (!value) {
    throw new ApiError(400, 'Answer cannot be empty.', 'empty_answer')
  }

  return value
}

