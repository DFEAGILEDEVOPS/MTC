'use strict'

const uuidv4 = require('uuid/v4')

const CheckForm = require('../models/check-form')
const Pupil = require('../models/pupil')
const School = require('../models/school')
const configService = require('../services/config-service')
const jwtService = require('../services/jwt-service')

/**
 * Returns the set of questions, pupil details and school details in json format
 * @param req
 * @param res
 * @returns { object }
 */

const getQuestions = async (req, res) => {
  const {pupilPin, schoolPin} = req.body
  if (!pupilPin || !schoolPin) return badRequest(res)
  let checkForm, config, pupil, school, token

  try {
    // Until we determine the logic behind fetching the appropriate check form
    // the pupil will receive the first one
    school = await School.findOne({schoolPin: schoolPin}).lean().exec()
    pupil = await Pupil.findOne({pin: pupilPin, school: school ? school._id : ''}).exec()
    checkForm = await CheckForm.findOne({}).lean().exec()
  } catch (error) {
    console.error(error)
    return serverError(res)
  }

  if (!pupil || !school) return unauthorised(res)
  if (!checkForm) return serverError(res)

  let {questions} = checkForm
  questions = questions.map((q, i) => { return {order: ++i, factor1: q.f1, factor2: q.f2} })

  const pupilData = {
    firstName: pupil.foreName,
    lastName: pupil.lastName,
    sessionId: uuidv4()
  }

  school = {id: school._id, name: school.name}

  try {
    config = await configService.getConfig()
  } catch (error) {
    console.error(error)
    return serverError()
  }

  try {
    token = await jwtService.createToken(pupil)
  } catch (error) {
    console.error(error)
    return serverError(res)
  }

  setJsonHeader(res)
  return res.send(JSON.stringify({
    questions,
    pupil: pupilData,
    school,
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
