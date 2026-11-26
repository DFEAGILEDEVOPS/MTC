import type { Response } from 'express'
import { DefaultSecurityHeaders } from '../routes/default-security-headers.js'
import { EmergencyOffSwitchEnabledErrorCode } from '../errors/emergency-off-switch-enabled.error.js'

const apiResponse = {
  unauthorised: (res: Response): Response => {
    apiResponse.setDefaultHeaders(res)
    return res.status(401).json({ error: 'Unauthorised' })
  },

  badRequest: (res: Response): Response => {
    apiResponse.setDefaultHeaders(res)
    return res.status(400).json({ error: 'Bad request' })
  },

  serverError: (res: Response): Response => {
    apiResponse.setDefaultHeaders(res)
    return res.status(500).json({ error: 'Server error' })
  },

  emergencyOffSwitchEnabled: (res: Response): Response => {
    apiResponse.setDefaultHeaders(res)
    return res.status(503).json({
      error: 'Service temporarily unavailable',
      code: EmergencyOffSwitchEnabledErrorCode
    })
  },

  messageTooLarge: (res: Response): Response => {
    apiResponse.setDefaultHeaders(res)
    return res.status(413).json({ error: 'Message size too large :(' })
  },

  sendJson: (res: Response, obj: object | string, code = 200): Response => {
    apiResponse.setDefaultHeaders(res)
    return res.status(code).json(obj)
  },

  setDefaultHeaders: (res: Response): void => {
    DefaultSecurityHeaders.setResponseHeaders(res)
    res.setHeader('Content-Type', 'application/json')
  }
}

export default apiResponse
