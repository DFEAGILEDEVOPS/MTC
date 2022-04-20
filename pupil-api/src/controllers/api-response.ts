import { Response } from 'express'

const apiResponse = {
  unauthorised: (res: Response) => {
    apiResponse.setDefaultHeaders(res)
    return res.status(401).json({ error: 'Unauthorised' })
  },

  badRequest: (res: Response) => {
    apiResponse.setDefaultHeaders(res)
    return res.status(400).json({ error: 'Bad request' })
  },

  serverError: (res: Response) => {
    apiResponse.setDefaultHeaders(res)
    return res.status(500).json({ error: 'Server error' })
  },

  sendJson: (res: Response, obj: object | string, code: number = 200) => {
    apiResponse.setDefaultHeaders(res)
    return res.status(code).json(obj)
  },

  setDefaultHeaders: (res: Response) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('Content-Type', 'application/json')
  }
}

export = apiResponse
