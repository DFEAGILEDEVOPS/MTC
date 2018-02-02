'use strict'

const apiResponse = require('./api-response')
const checkFormService = require('../services/check-form.service')
const checkStartService = require('../services/check-start.service')
const checkWindowService = require('../services/check-window.service')
const configService = require('../services/config.service')
const jwtService = require('../services/jwt.service')
const pupilAuthenticationService = require('../services/pupil-authentication.service')
const pupilLogonEventService = require('../services/pupil-logon-event.service')

/**
 * If the Pupil authenticates: returns the set of questions, pupil details and school details in json format
 * @param req
 * @param res
 * @returns { object }
 */

const getQuestions = async (req, res) => {
  const {pupilPin, schoolPin} = req.body

  if (!pupilPin || !schoolPin) {
    await pupilLogonEventService.storeLogonEvent(null, schoolPin, pupilPin, false, 400, 'Bad request')
    return apiResponse.badRequest(res)
  }

  let config, data, questions, token

  try {
    data = await pupilAuthenticationService.authenticate(pupilPin, schoolPin)
  } catch (error) {
    await pupilLogonEventService.storeLogonEvent(null, schoolPin, pupilPin, false, 401, 'Unauthorised')
    return apiResponse.unauthorised(res)
  }

  try {
    await checkWindowService.isLoginAllowed()
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
    await pupilLogonEventService.storeLogonEvent(data.pupil.id, schoolPin, pupilPin, false, 500, 'Server error: config')
    return apiResponse.serverError(res)
  }
  try {
    token = await jwtService.createToken(data.pupil)
  } catch (error) {
    await pupilLogonEventService.storeLogonEvent(data.pupil.id, schoolPin, pupilPin, false, 500, 'Server error: token')
    return apiResponse.serverError(res)
  }

  // start the check
  try {
    const checkData = await checkStartService.pupilLogin(data.pupil.id)
    questions = checkFormService.prepareQuestionData(checkData.questions)
    pupilData.checkCode = checkData.checkCode
  } catch (error) {
    await pupilLogonEventService.storeLogonEvent(data.pupil.id, schoolPin, pupilPin, false, 500, 'Server error: check data')
    return apiResponse.serverError(res)
  }

  await pupilLogonEventService.storeLogonEvent(data.pupil.id, schoolPin, pupilPin, true, 200)

  const responseData = {
    questions,
    pupil: pupilData,
    school: schoolData,
    config,
    access_token: token.token
  }

  apiResponse.sendJson(res, responseData)
}

module.exports = {
  getQuestions
}
