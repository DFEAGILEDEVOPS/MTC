'use strict'

const apiResponse = require('./api-response')
const checkFormService = require('../services/check-form.service')
const checkStartService = require('../services/check-start.service')
const checkWindowService = require('../services/check-window.service')
const config = require('../config')
const configService = require('../services/config.service')
const jwtService = require('../services/jwt.service')
const moment = require('moment')
const pupilAuthenticationService = require('../services/pupil-authentication.service')
const pupilDataService = require('../services/data-access/pupil.data.service')
const pupilLogonEventService = require('../services/pupil-logon-event.service')
const R = require('ramda')
const winston = require('winston')


/**
 * If the Pupil authenticates: returns the set of questions, pupil details and school details in json format
 * @param req
 * @param res
 * @returns { object }
 */

const storeLogonEvent = async (pupilId, schoolPin, pupilPin, isAuthenticated, httpStatusCode, httpErrorMessage = null) => {
  try {
    await pupilLogonEventService.storeLogonEvent(pupilId, schoolPin, pupilPin, isAuthenticated, httpStatusCode, httpErrorMessage)
  } catch (error) {
    winston.error('unable to record pupil logon event:', error)
  }
}

const getQuestions = async (req, res) => {
  const {pupilPin, schoolPin} = req.body

  if (!pupilPin || !schoolPin) {
    await storeLogonEvent(null, schoolPin, pupilPin, false, 400, 'Bad request')
    return apiResponse.badRequest(res)
  }

  let pupilConfig, data, questions, token
  try {
    data = await pupilAuthenticationService.authenticate(pupilPin, schoolPin)
  } catch (error) {
    winston.error('Failed to authenticate pupil: ' + error.message)
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
      await checkStartService.prepareCheck([data.pupil.id], data.school.dfeNumber, data.school.id, 'familiarisation')
    }
  } catch (error) {
    winston.error('Failed to prepare test account: ' + error.message)
    return apiResponse.serverError(res)
  }

  // Check that the check window is active
  try {
    await checkWindowService.getActiveCheckWindow(data.pupil.id)
  } catch (error) {
    return apiResponse.sendJson(res, 'Forbidden', 403)
  }

  const pupilData = pupilAuthenticationService.getPupilDataForSpa(data.pupil)
  const schoolData = {
    id: data.school.id,
    name: data.school.name
  }

  try {
    pupilConfig = await configService.getConfig(data.pupil)
  } catch (error) {
    winston.error('Failed to get config: ' + error.message)
    await storeLogonEvent(data.pupil.id, schoolPin, pupilPin, false, 500, 'Server error: config')
    return apiResponse.serverError(res)
  }

  try {
    const expiryDate = moment().add(config.Tokens.jwtTimeOutHours, 'hours')
    token = await jwtService.createToken(data.pupil, expiryDate)
    await pupilDataService.sqlUpdate({id: data.pupil.id, jwtToken: token.token, jwtSecret: token.jwtSecret}) // Placeholder until this entire api is removed.
  } catch (error) {
    winston.error('Failed to create a JWT: ' + error.message)
    await storeLogonEvent(data.pupil.id, schoolPin, pupilPin, false, 500, 'Server error: token')
    return apiResponse.serverError(res)
  }

  // start the check
  try {
    const checkData = await checkStartService.pupilLogin(data.pupil.id)
    questions = checkFormService.prepareQuestionData(checkData.questions)
    pupilData.checkCode = checkData.checkCode
  } catch (error) {
    winston.error('Failed to prepare question data: ' + error.message)
    await storeLogonEvent(data.pupil.id, schoolPin, pupilPin, false, 500, 'Server error: check data')
    return apiResponse.serverError(res)
  }

  await storeLogonEvent(data.pupil.id, schoolPin, pupilPin, true, 200)

  const responseData = {
    questions,
    pupil: pupilData,
    school: schoolData,
    config: pupilConfig,
    access_token: token.token
  }

  apiResponse.sendJson(res, responseData)
}

module.exports = {
  getQuestions
}
