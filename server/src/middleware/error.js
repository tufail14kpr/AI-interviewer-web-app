import { ApiError } from '../lib/ApiError.js'

export const notFoundHandler = (_request, _response, next) => {
  next(new ApiError(404, 'Resource not found.', 'not_found'))
}

export const errorHandler = (error, _request, response, _next) => {
  const statusCode = error instanceof ApiError ? error.statusCode : 500
  const payload = {
    error: {
      code: error.code || 'internal_server_error',
      message: error.message || 'Something went wrong.'
    }
  }

  if (error.details) {
    payload.error.details = error.details
  }

  if (statusCode >= 500) {
    console.error(error)
  }

  response.status(statusCode).json(payload)
}

