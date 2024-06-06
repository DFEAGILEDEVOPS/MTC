import type { Response } from 'express'
import { DefaultSecurityHeaders } from '../routes/default-security-headers'

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

  messageTooLarge: (res: Response): Response => {
    apiResponse.setDefaultHeaders(res)
    return res.status(413).json({ error: 'Message size too large :(' })
  },

  sendJson: (res: Response, obj: object | string, code: number = 200): Response => {
    apiResponse.setDefaultHeaders(res)
    return res.status(code).json(obj)
  },

  setDefaultHeaders: (res: Response): void => {
    DefaultSecurityHeaders.setResponseHeaders(res)
    res.setHeader('Content-Type', 'application/json')
  }
}

export = apiResponse
