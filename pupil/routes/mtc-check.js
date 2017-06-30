'use strict'

const express = require('express')
const router = express.Router()
const uuidV4 = require('uuid/v4')

const QuestionService = require('../lib/question-service')
const GoogleSheetService = require('../lib/google-sheet-service')
const isAuthenticated = require('../authentication/middleware')
const Feedback = require('../models/feedback')
const Answer = require('../models/answer')
const Pupil = require('../models/pupil')

/* GET start page. */
router.get('/start', isAuthenticated(), function (req, res, next) {
  res.locals.pageTitle = 'Multiplication Tables Check - start'
  res.render('check/start', {layout: 'question-layout'}) // Temp layout
})

/* GET confirmation page. */
router.get('/confirm', isAuthenticated(), function (req, res, next) {
  res.locals.pageTitle = 'Multiplication tables check - confirmation'
  res.render('check/confirm', {layout: 'question-layout'}) // Temp layout
})

/* GET speedcheck page. */
router.get('/connection', isAuthenticated(), function (req, res, next) {
  res.locals.pageTitle = 'Multiplication tables check - setup'
  res.render('check/connection', {layout: 'question-layout'}) // Temp layout
})

/* GET the questions */
router.get('/question/:number', isAuthenticated(), async function (req, res, next) {
  res.locals.pageTitle = 'Multiplication tables check - question'
  let num = parseInt(req.params.number, 10)

  if (isNaN(num)) {
    return next(new Error('Question not found'))
  }

  if (num === 1) {
    // First Question: create a new testId for this test
    req.session.testId = uuidV4()
    delete req.session.answer
    // Expire the pin on the first question
    try {
      const pupil = await Pupil.findOne({'_id': (((res || {}).req || {}).user || {})}).exec()
      if (!pupil.pinExpired) {
        pupil.pinExpired = true
        await pupil.save()
      }
    } catch (error) {
      return next(error)
    }
  }

  const questionService = new QuestionService('sample-questions')
  const question = questionService.getQuestion(num)
  res.locals.factor1 = question[0]
  res.locals.factor2 = question[1]
  res.locals.expectedAnswer = question[2]
  res.locals.nextQuestion = questionService.getNextQuestionNumber(num)
  res.locals.num = num
  res.locals.answer = question[0] * question[1]
  res.locals.total = questionService.getNumberOfQuestions()

  res.render('check/question-virtual-keyboard', {layout: 'question-layout'})
})

/* GET the questions */
router.post('/question/:number', isAuthenticated(), function (req, res, next) {
  let answer
  let num = parseInt(req.params.number, 10)
  let question
  let questionService
  let nextQuestion
  let redirectUrl

  if (isNaN(num)) {
    return next(new Error('Question not found'))
  }

  if (!req.session.testId) {
    return next(new Error('Missing testId'))
  }

  questionService = new QuestionService('sample-questions')
  question = questionService.getQuestion(num)

  if (!req.session.answer) {
    // Save the answer
    answer = new Answer()
    answer.sessionId = req.session.id
    answer.testId = req.session.testId
    answer.logonEvent = req.session.logonEvent._id
    answer.pupil = req.user._id
    answer.school = req.user.school._id
    const registeredInputs = JSON.parse(req.body['registered-inputs']).map((r) => JSON.parse(r))
    const isElectron = req.body['electron'] === 'true' ? true : false
    answer.isElectron = isElectron
    answer.answers = [{
      pageLoadDate: req.body.pageLoadDate,
      answerDate: Date.now(),
      factor1: question[0],
      factor2: question[1],
      input: req.body.answer,
      registeredInputs
    }]
  } else {
    answer = new Answer(req.session.answer)
    answer.sessionId = req.session.id
    answer.testId = req.session.testId
    const registeredInputs = JSON.parse(req.body['registered-inputs']).map((r) => JSON.parse(r))
    answer.answers.push({
      pageLoadDate: req.body.pageLoadDate,
      answerDate: Date.now(),
      factor1: question[0],
      factor2: question[1],
      input: req.body.answer,
      registeredInputs
    })
  }

  req.session.answer = answer.toPojo()

  // This is debug, but useful for now.
  // TODO: change to use logger and DEBUG level
  // let correctAnswer = question[0] * question[1];
  // if (correctAnswer === (req.body.answer * 1)) {
  //   console.log(`Correct: ${question[0]} * ${question[1]} = ${correctAnswer}`);
  // } else {
  //   console.log(`Incorrect: ${question[0]} * ${question[1]} = ${correctAnswer} (got ${req.body.answer})`);
  // }

  nextQuestion = questionService.getNextQuestionNumber(num)
  if (!nextQuestion) {
    redirectUrl = '/check/complete'
  } else {
    redirectUrl = '/check/question/' + nextQuestion
  }

  // Mark the form if this is the answer to the last question.
  if (answer.answers.length === questionService.getNumberOfQuestions()) {
    answer.markResults()
  }

  answer.save(function (err) {
    if (err) {
      return next(new Error('Failed to save answer: ' + err.message))
    }
  })

  res.redirect(redirectUrl)
})

/* GET the completion page */
router.get('/complete', isAuthenticated(), async function (req, res, next) {
  res.locals.pageTitle = 'Multiplication tables check - complete'

  // Clean up session vars from the check
  delete req.session.testId
  delete req.session.answer

  // Save test end time
  try {
    const pupil = await Pupil.findOne({'_id': (((res || {}).req || {}).user || {})._id || {}}).exec()
    pupil.checkEndDate = Date.now()
    await pupil.save()
  } catch (error) {
    return next(error)
  }

  res.render('check/complete', {layout: 'question-layout'}) // Temp layout
})

/* GET the feedback form */
router.get('/feedback', isAuthenticated(), function (req, res, next) {
  res.locals.pageTitle = 'Multiplication tables check - give feedback'
  res.render(
    'check/feedback',
    {
      error: {},
      form: {},
      layout: 'question-layout' // Temp layout
    })
})

/* POST from the feedback form */
router.post('/feedback', async function (req, res, next) {
  const feedback = new Feedback()
  feedback.comment = req.body.comment
  feedback.inputType = req.body['input-type']
  feedback.satisfactionRating = req.body['satisfaction-group']
  feedback.sessionId = req.session.id

  try {
    await feedback.validate()
  } catch (error) {
    res.locals.pageTitle = 'Multiplication tables check - give feedback'
    return res.render(
      'check/feedback',
      {
        error: error || {},
        form: req.body,
        layout: 'question-layout' // Temp layout
      })
  }

  try {
    const feedbackExists = await Feedback.findOne({'sessionId': feedback.sessionId}).exec()
    if (feedbackExists) {
      return res.redirect('/check/feedback-sent')
    }

    // Save to our db
    await feedback.save()

    // Insert into Google Sheet
    let schoolName = ''
    if ((((res || {}).req || {}).user || {}).school) {
      schoolName = res.req.user.school.name
    }

    // Insert to Google Sheets
    const googleSheetData = {
      'Timestamp': feedback.creationDate,
      'School Name': schoolName,
      'Satisfaction Rating': feedback.satisfactionRating,
      'Input Type': feedback.inputType,
      'Comment': feedback.comment || ''
    }
    GoogleSheetService.addFeedback(googleSheetData)

    return res.redirect('/check/feedback-thanks')
  } catch (error) {
    return next(error)
  }
})

/* GET the thank you form */
router.get('/feedback-thanks', function (req, res, next) {
  res.locals.pageTitle = 'Multiplication tables check - thank you for your feedback'
  res.render('check/feedback-thanks', {layout: 'question-layout'}) // Temp layout
})

/* GET feedback already received */
router.get('/feedback-sent', function (req, res, next) {
  res.locals.pageTitle = 'Multiplication tables check - feedback already received'
  res.render('check/feedback-sent', {layout: 'question-layout'}) // Temp layout
})

/* Sign in success */
router.get('/sign-in-success', isAuthenticated(), async function (req, res, next) {
  if (((res || {}).req || {}).user) {
    const pupil = ((res || {}).req || {}).user

    if (pupil.foreName.length < 1 || pupil.lastName.length < 1 || pupil.school.name < 1) {
      res.redirect('/')
    } else {
      res.locals.foreName = pupil.foreName
      res.locals.lastName = pupil.lastName
      res.locals.school = pupil.school.name
      res.locals.pageTitle = 'Multiplication tables check - Welcome'
      res.render('sign-in-success-5pin', {layout: 'question-layout'}) // Temp layout
    }
  } else {
    res.redirect('/')
  }
})

router.post('/start-check', isAuthenticated(), async function (req, res, next) {
  try {
    const pupil = await Pupil.findOne({'_id': (((res || {}).req || {}).user || {})._id || {}}).exec()
    pupil.checkStartDate = Date.now()
    await pupil.save()
  } catch (error) {
    return next(error)
  }

  res.redirect('/check/question/1')
})

module.exports = router
