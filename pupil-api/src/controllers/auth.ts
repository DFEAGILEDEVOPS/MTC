'use strict'

import * as winston from 'winston'
import { Request, Response } from 'express'
import * as jwtService from '../services/jwt.service'
import * as apiResponse from './api-response'
import * as checkFormService from '../services/check-form.service'
import * as checkStartService from '../services/check-start.service'
import * as configService from '../services/config.service'
import * as pupilAuthenticationService from '../services/pupil-authentication.service'
import * as pupilLogonEventService from '../services/pupil-logon-event.service'
import * as checkWindowService from '../services/check-window.service'
import * as R from 'ramda'

const storeLogonEvent = async (pupilId, schoolPin, pupilPin, isAuthenticated, httpStatusCode, httpErrorMessage = null) => {
  try {
    await pupilLogonEventService.storeLogonEvent(pupilId, schoolPin, pupilPin, isAuthenticated, httpStatusCode, httpErrorMessage)
  } catch (error) {
    winston.error('unable to record pupil logon event:', error)
  }
}

/**
 * If the Pupil authenticates: returns the set of questions, pupil details and school details in json format
 */
const getAuth: any = async (req: Request, res: Response) => {
  const { pupilPin, schoolPin } = req.body

  if (!pupilPin || !schoolPin) {
    await storeLogonEvent(null, schoolPin, pupilPin, false, 400, 'Bad request')
    return apiResponse.badRequest(res)
  }

  let config
  let data
  let questions
  let token
  let checkWindow
  try {
    data = await pupilAuthenticationService.authenticate(pupilPin, schoolPin)
  } catch (error) {
    await storeLogonEvent(null, schoolPin, pupilPin, false, 401, 'Unauthorised')
    return apiResponse.unauthorised(res)
  }

  try {
    if (data.pupil.isTestAccount) {
      // prepare a check instance on the fly for test accounts
      const currentWindows = await checkWindowService.getCurrentCheckWindowsAndCountForms()
      const firstWindow = R.head(currentWindows)
      if (!firstWindow) {
        const errorMessage = 'test account unable to login as no current check window available'
        winston.warn(errorMessage)
        await storeLogonEvent(data.pupil.id, schoolPin, pupilPin, false, 500, errorMessage)
        return apiResponse.serverError(res)
      }
      await checkStartService.prepareCheck([data.pupil.id], data.school.dfeNumber)
    }
  } catch (error) {
    return apiResponse.serverError(res)
  }

  try {
    checkWindow = await checkWindowService.getActiveCheckWindow(data.pupil.id)
  } catch (error) {
    return apiResponse.sendJson(res, 'Forbidden', 403)
  }
  const pupilData = pupilAuthenticationService.getPupilDataForSpa(data.pupil)
  const schoolData = {
    id: data.school.id,
    name: data.school.name
  }
  try {
    config = await configService.getConfig(data.pupil)
  } catch (error) {
    await storeLogonEvent(data.pupil.id, schoolPin, pupilPin, false, 500, 'Server error: config')
    return apiResponse.serverError(res)
  }
  try {
    const checkWindowEndDate = checkWindow && checkWindow.checkEndDate
    token = await jwtService.createToken(data.pupil, checkWindowEndDate)
  } catch (error) {
    await storeLogonEvent(data.pupil.id, schoolPin, pupilPin, false, 500, 'Server error: token')
    return apiResponse.serverError(res)
  }

  // start the check
  try {
    const checkData = await checkStartService.pupilLogin(data.pupil.id)
    questions = checkFormService.prepareQuestionData(checkData.questions)
    pupilData.checkCode = checkData.checkCode
  } catch (error) {
    await storeLogonEvent(data.pupil.id, schoolPin, pupilPin, false, 500, 'Server error: check data')
    return apiResponse.serverError(res)
  }

  await storeLogonEvent(data.pupil.id, schoolPin, pupilPin, true, 200)

  const responseData = {
    questions,
    pupil: pupilData,
    school: schoolData,
    config,
    access_token: token.token
  }

  apiResponse.sendJson(res, responseData)
}

export = getAuth
