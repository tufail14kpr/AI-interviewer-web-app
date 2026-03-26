const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

const buildHeaders = (token, hasBody) => {
  const headers = {}

  if (hasBody) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

export const apiRequest = async ({ path, method = 'GET', token, body }) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: buildHeaders(token, body !== undefined),
    body: body !== undefined ? JSON.stringify(body) : undefined
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(payload?.error?.message || 'Request failed.')
    error.code = payload?.error?.code || 'request_failed'
    throw error
  }

  return payload
}

export const authApi = {
  signup: (body) => apiRequest({ path: '/api/auth/signup', method: 'POST', body }),
  login: (body) => apiRequest({ path: '/api/auth/login', method: 'POST', body }),
  me: (token) => apiRequest({ path: '/api/auth/me', token })
}

export const interviewApi = {
  list: (token) => apiRequest({ path: '/api/interviews', token }),
  create: (token, body) => apiRequest({ path: '/api/interviews', method: 'POST', token, body }),
  get: (token, sessionId) => apiRequest({ path: `/api/interviews/${sessionId}`, token }),
  answer: (token, sessionId, body) =>
    apiRequest({ path: `/api/interviews/${sessionId}/answer`, method: 'POST', token, body }),
  complete: (token, sessionId) =>
    apiRequest({ path: `/api/interviews/${sessionId}/complete`, method: 'POST', token }),
  report: (token, sessionId) => apiRequest({ path: `/api/reports/${sessionId}`, token })
}

export const adminApi = {
  overview: (token) => apiRequest({ path: '/api/admin/overview', token }),
  createInterview: (token, body) => apiRequest({ path: '/api/admin/interviews', method: 'POST', token, body }),
  getInterview: (token, sessionId) => apiRequest({ path: `/api/admin/interviews/${sessionId}`, token })
}
