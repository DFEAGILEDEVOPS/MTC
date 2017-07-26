const CheckForm = require('../models/check-form')
const Pupil = require('../models/pupil')
const School = require('../models/school')
const { QUESTION_TIME_LIMIT, TIME_BETWEEN_QUESTIONS } = require('../config')

/**
 * Returns the set of questions, pupil details and school details in json format
 * @param req
 * @param res
 * @returns { object }
 */

const getQuestions = async (req, res) => {
  const { pupilPin, schoolPin } = req.body
  if (!pupilPin || !schoolPin) res.status(400).json({ error: 'Invalid input' })
  let checkForm, pupil, school
  try {
    // Until we determine the logic behind fetching the appropriate check form
    // the pupil will receive the first one
    pupil = await Pupil.findOne({ 'pin': pupilPin }).lean().exec()
    school = await School.findOne({'schoolPin': schoolPin}).lean().exec()
    checkForm = await CheckForm.findOne({}).sort({createdAt: 1}).lean().exec()
  } catch (error) {
    throw new Error(error)
  }
  if (!checkForm) res.status(404).json({ error: 'Question set not found for pupil' })
  if (!pupil || !school) res.status(401).json({ error: 'Unauthorised' })
  let { questions } = checkForm
  questions = questions.map((q, i) => { return { order: ++i, factor1: q.f1, factor2: q.f2 } })
  pupil = {
    firstName: pupil.foreName,
    lastName: pupil.lastName,
    sessionId: req.session.id,
    questionTime: QUESTION_TIME_LIMIT,
    loadingTime: TIME_BETWEEN_QUESTIONS
  }
  school = { id: school._id, name: school.name }
  res.setHeader('Content-Type', 'application/json')
  res.send(JSON.stringify({
    questions,
    pupil,
    school
  }))
}

module.exports = {
  getQuestions
}
