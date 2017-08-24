const uuidv4 = require('uuid/v4')
const CheckForm = require('../models/check-form')
const Pupil = require('../models/pupil')
const School = require('../models/school')
const configService = require('../services/config-service')
const jwt = require('jsonwebtoken')


/**
 * Returns the set of questions, pupil details and school details in json format
 * @param req
 * @param res
 * @returns { object }
 */

const getQuestions = async (req, res) => {
  const {pupilPin, schoolPin} = req.body
  if (!pupilPin || !schoolPin) return res.status(400).json({error: 'Bad Request'})
  let checkForm, pupil, school
  try {
    // Until we determine the logic behind fetching the appropriate check form
    // the pupil will receive the first one
    pupil = await Pupil.findOne({'pin': pupilPin}).lean().exec()
    school = await School.findOne({'schoolPin': schoolPin}).lean().exec()
    checkForm = await CheckForm.findOne({}).lean().exec()
  } catch (error) {
    throw new Error(error)
  }
  if (!pupil || !school) return res.status(401).json({error: 'Unauthorised'})
  if (!checkForm) return res.status(500).json({error: 'Question set not found for pupil'})

  let {questions} = checkForm
  questions = questions.map((q, i) => { return {order: ++i, factor1: q.f1, factor2: q.f2} })
  const uuid = uuidv4()
  const pupilData = {
    firstName: pupil.foreName,
    lastName: pupil.lastName,
    sessionId: uuid
  }
  school = {id: school._id, name: school.name}
  const config = await configService.getConfig()

  // Generate the JWT token
  // TODO: for additional security add in a device Id
  const payload = {
    iss: 'MTC Admin',                                       // Issuer
    sub: pupil._id,                                         // Subject
    exp: Math.floor(Date.now() / 1000) + (60 * 60),         // Expiry
    nbf: Math.floor(Date.now() / 1000),                     // Not before
    jwi: uuid                                               // JWT token ID
  }

  // Construct a JWT token
  const token = jwt.sign(payload, 'sekret')

  res.setHeader('Content-Type', 'application/json')
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
