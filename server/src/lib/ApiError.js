export class ApiError extends Error {
  constructor(statusCode, message, code = 'request_failed', details) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }
}

