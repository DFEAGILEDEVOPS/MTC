const uuidV4 = require('uuid/v4')

const QuestionService = require('../lib/question-service')
const Pupil = require('../models/pupil')
const Setting = require('../models/setting')
const config = require('../config')

const getIntro = (req, res) => {
  res.locals.pageTitle = 'Warm-up questions'
  res.render('warm-up/intro', { layout: 'question-layout' }) // Temp layout)
}
const getQuestion = async (req, res, next) => {
  res.locals.pageTitle = 'Warm-up questions'
  const num = parseInt(req.params.number, 10)

  if (isNaN(num)) {
    return next(new Error('Question not found'))
  }

  if (num === 1) {
    // First Question: create a new testId for this test
    req.session.testId = uuidV4()
    delete req.session.answer

    // Get warm up startDate
    try {
      const pupil = await Pupil.findOne({'_id': (((res || {}).req || {}).user || {})}).exec()
      pupil.warmUpStartDate = Date.now()
      await pupil.save()
    } catch (error) {
      return next(error)
    }
  }

  let loadingTime = config.TIME_BETWEEN_QUESTIONS
  let questionTimeLimit = config.TIME_BETWEEN_QUESTIONS

  try {
    const timeSettings = await Setting.findOne().exec()
    if (timeSettings) {
      loadingTime = timeSettings.loadingTimeLimit
      questionTimeLimit = timeSettings.questionTimeLimit
    }
  } catch (error) {
    console.log('Loading time not found, default value used')
  }

  const questionService = new QuestionService('form-warm-up')
  const question = questionService.getQuestion(num)
  res.locals.loadingTime = loadingTime
  res.locals.questionTimeLimit = questionTimeLimit
  res.locals.factor1 = question[0]
  res.locals.factor2 = question[1]
  res.locals.expectedAnswer = question[2]
  res.locals.nextQuestion = questionService.getNextQuestionNumber(num)
  res.locals.num = num
  res.locals.answer = question[0] * question[1]
  res.locals.total = questionService.getNumberOfQuestions()

  res.render('warm-up/question', { layout: 'question-layout' })
}

const postQuestion = async (req, res, next) => {
  const num = parseInt(req.params.number, 10)
  let redirectUrl

  if (isNaN(num)) {
    return next(new Error('Question not found'))
  }

  if (!req.session.testId) {
    return next(new Error('Missing testId'))
  }

  const questionService = new QuestionService('form-warm-up')
  const nextQuestion = questionService.getNextQuestionNumber(num)
  if (!nextQuestion) {
    // Get warm up endDate
    // Will be refactored to a common helper func for all cases
    try {
      const pupil = await Pupil.findOne({'_id': (((res || {}).req || {}).user || {})}).exec()
      pupil.warmUpEndDate = Date.now()
      await pupil.save()
    } catch (error) {
      return next(error)
    }
    redirectUrl = '/warm-up/complete'
  } else {
    redirectUrl = '/warm-up/question/' + nextQuestion
  }
  res.redirect(redirectUrl)
}

const getComplete = (req, res) => {
  res.locals.pageTitle = 'Warm-up questions - complete'
  // Clean up session vars from the check
  delete req.session.testId
  delete req.session.answer
  res.render('warm-up/complete', { layout: 'question-layout' }) // Temp layout
}

module.exports = {
  getIntro,
  getQuestion,
  postQuestion,
  getComplete
}
