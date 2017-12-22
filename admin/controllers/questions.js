'use strict'

const checkFormService = require('../services/check-form.service')
const checkStartService = require('../services/check-start.service')
const configService = require('../services/config.service')
const jwtService = require('../services/jwt.service')
const pupilAuthenticationService = require('../services/pupil-authentication.service')
const apiResponse = require('./api-response')

/**
 * If the Pupil authenticates: returns the set of questions, pupil details and school details in json format
 * @param req
 * @param res
 * @returns { object }
 */

const getQuestions = async (req, res) => {
  const {pupilPin, schoolPin} = req.body
  if (!pupilPin || !schoolPin) return apiResponse.badRequest(res)
  let config, pupil, questions, token

  try {
    pupil = await pupilAuthenticationService.authenticate(pupilPin, schoolPin)
  } catch (error) {
    return apiResponse.unauthorised(res)
  }

  const pupilData = pupilAuthenticationService.getPupilDataForSpa(pupil)

  const schoolData = {
    id: pupil.school._id,
    name: pupil.school.name
  }

  try {
    config = await configService.getConfig(pupil)
  } catch (error) {
    return apiResponse.serverError(res)
  }

  try {
    token = await jwtService.createToken(pupil)
  } catch (error) {
    return apiResponse.serverError(res)
  }

  // start the check
  try {
    const startCheckResponse = await checkStartService.startCheck(pupil._id)
    questions = checkFormService.prepareQuestionData(startCheckResponse.checkForm)
    pupilData.checkCode = startCheckResponse.checkCode
  } catch (error) {
    return apiResponse.serverError(res)
  }

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
