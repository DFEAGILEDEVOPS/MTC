'use strict'

const checkFormService = require('../services/check-form.service')
const checkStartService = require('../services/check-start.service')
const configService = require('../services/config.service')
const jwtService = require('../services/jwt.service')
const pupilAuthenticationService = require('../services/pupil-authentication.service')

/**
 * If the Pupil authenticates: returns the set of questions, pupil details and school details in json format
 * @param req
 * @param res
 * @returns { object }
 */

const getQuestions = async (req, res) => {
  const {pupilPin, schoolPin} = req.body
  if (!pupilPin || !schoolPin) return badRequest(res)
  let config, checkCode, checkForm, pupil, questions, token

  try {
    pupil = await pupilAuthenticationService.authenticate(pupilPin, schoolPin)
  } catch (error) {
    return unauthorised(res)
  }

  const pupilData = {
    firstName: pupil.foreName,
    lastName: pupil.lastName
  }

  const schoolData = {
    id: pupil.school._id,
    name: pupil.school.name
  }

  try {
    config = await configService.getConfig()
  } catch (error) {
    return serverError(res)
  }

  try {
    token = await jwtService.createToken(pupil)
  } catch (error) {
    return serverError(res)
  }

  // start the check
  try {
    ({ checkCode, checkForm } = await checkStartService.startCheck(pupil._id))
    questions = checkFormService.prepareQuestionData(checkForm)
    pupilData.checkCode = checkCode
  } catch (error) {
    return serverError(res)
  }

  const responseData = {
    questions,
    pupil: pupilData,
    school: schoolData,
    config,
    access_token: token
  }

  // console.log('response', responseData)

  setJsonHeader(res)
  return res.send(JSON.stringify(responseData))
}

module.exports = {
  getQuestions
}

function unauthorised (res) {
  setJsonHeader(res)
  return res.status(401).json({error: 'Unauthorised'})
}

function badRequest (res) {
  setJsonHeader(res)
  return res.status(400).json({error: 'Bad request'})
}

function serverError (res) {
  setJsonHeader(res)
  return res.status(500).json({error: 'Server error'})
}

function setJsonHeader (res) {
  res.setHeader('Content-Type', 'application/json')
}
