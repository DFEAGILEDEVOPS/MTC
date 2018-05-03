import { Response } from 'express'

const apiResponse = {
  unauthorised: (res: Response) => {
    apiResponse.setJsonHeader(res)
    return res.status(401).json({ error: 'Unauthorised' })
  },

  badRequest: (res: Response) => {
    apiResponse.setJsonHeader(res)
    return res.status(400).json({ error: 'Bad request' })
  },

  serverError: (res: Response) => {
    apiResponse.setJsonHeader(res)
    return res.status(500).json({ error: 'Server error' })
  },

  sendJson: (res: Response, obj: object | string, code: number = 200) => {
    apiResponse.setJsonHeader(res)
    res.status(code).json(obj)
  },

  setJsonHeader: (res: Response) => {
    res.setHeader('Content-Type', 'application/json')
  }
}

export = apiResponse
