import { env } from '../config/env.js'

export const isAdminEmail = (email) => env.adminEmails.includes(String(email || '').trim().toLowerCase())

export const resolveUserRole = (email, currentRole = 'candidate') => {
  if (currentRole === 'admin' || isAdminEmail(email)) {
    return 'admin'
  }

  return 'candidate'
}

export const isAdminUser = (user) => resolveUserRole(user?.email, user?.role) === 'admin'
