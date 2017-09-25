'use strict'

const uuidv4 = require('uuid/v4')

const pupilAuthenticationService = require('../services/pupil-authentication.service')
const checkFormService = require('../services/check-form.service')
const configService = require('../services/config.service')
const jwtService = require('../services/jwt.service')

/**
 * If the Pupil authenticates: returns the set of questions, pupil details and school details in json format
 * @param req
 * @param res
 * @returns { object }
 */

const getQuestions = async (req, res) => {
  const {pupilPin, schoolPin} = req.body
  if (!pupilPin || !schoolPin) return badRequest(res)
  let config, pupil, questions, token

  try {
    pupil = await pupilAuthenticationService.authenticate(pupilPin, schoolPin)
  } catch (error) {
    return unauthorised(res)
  }

  try {
    questions = await checkFormService.getQuestions()
  } catch (error) {
    return serverError(res)
  }

  const pupilData = {
    firstName: pupil.foreName,
    lastName: pupil.lastName,
    sessionId: uuidv4()
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

  setJsonHeader(res)
  return res.send(JSON.stringify({
    questions,
    pupil: pupilData,
    school: schoolData,
    config,
    access_token: token
  }))
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
