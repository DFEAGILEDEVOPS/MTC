'use strict'

import * as jwtService from '../services/jwt.service'
import * as pinService from '../services/pin.service'
import * as apiResponse from './api-response'
import { Request, Response } from 'express'

/**
 * Expires the pupil's pin
 */
const checkStarted: object = async (req: Request, res: Response) => {
  const { checkCode, accessToken } = req.body
  if (!checkCode) return apiResponse.badRequest(res)
    // User verification
  try {
    await jwtService.verify(accessToken)
  } catch (error) {
    return apiResponse.unauthorised(res)
  }

  try {
    await pinService.expirePupilPin(accessToken, checkCode)
  } catch (error) {
    return apiResponse.serverError(res)
  }

  return apiResponse.sendJson(res, 'OK', 201)
}

export = checkStarted
