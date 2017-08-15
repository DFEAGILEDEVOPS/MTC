const CheckForm = require('../models/check-form')
const Pupil = require('../models/pupil')
const School = require('../models/school')
const configService = require('../services/config-service')

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
    checkForm = await CheckForm.findOne({}).sort({createdAt: 1}).lean().exec()
  } catch (error) {
    throw new Error(error)
  }
  if (!pupil || !school) return res.status(401).json({error: 'Unauthorised'})
  if (!checkForm) return res.status(404).json({error: 'Question set not found for pupil'})

  let {questions} = checkForm
  questions = questions.map((q, i) => { return {order: ++i, factor1: q.f1, factor2: q.f2} })
  pupil = {
    firstName: pupil.foreName,
    lastName: pupil.lastName,
    sessionId: req.session.id
  }
  school = {id: school._id, name: school.name}

  const config = await configService.getConfig()

  res.setHeader('Content-Type', 'application/json')
  return res.send(JSON.stringify({
    questions,
    pupil,
    school,
    config
  }))
}

module.exports = {
  getQuestions
}
