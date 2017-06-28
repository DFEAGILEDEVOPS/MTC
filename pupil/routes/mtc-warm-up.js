'use strict';

const express = require('express');
const router = express.Router();
const passport = require('passport');
const uuidV4 = require('uuid/v4');

const QuestionService = require('../lib/question-service');
const isAuthenticated = require('../authentication/middleware');
const Pupil = require('../models/pupil');
// const Feedback = require('../models/feedback');

/* Warm-up questions */
/* GET Intro */
router.get('/intro', isAuthenticated(), function (req, res, next) {
  res.locals.pageTitle = 'Warm-up questions';
  res.render('warm-up/intro', { layout: 'question-layout' }); // Temp layout);
});

/* GET the questions */
router.get('/question/:number', isAuthenticated(), async function (req, res, next) {
  res.locals.pageTitle = 'Warm-up questions';
  const num = parseInt(req.params.number, 10);

  if (isNaN(num)) {
    return next(new Error('Question not found'));
  }

  if (num === 1) {
    // First Question: create a new testId for this test
    req.session.testId = uuidV4();
    delete req.session.answer;

    // Get warm up startDate
    try {
      const pupil = await Pupil.findOne({'_id': (((res || {}).req || {}).user || {})}).exec();
      pupil.warmUpStartDate = Date.now();
      await pupil.save();
    } catch (error) {
      return next(error);
    }
  }

  const questionService = new QuestionService('form-warm-up');
  const question = questionService.getQuestion(num);
  res.locals.factor1 = question[0];
  res.locals.factor2 = question[1];
  res.locals.expectedAnswer = question[2];
  res.locals.nextQuestion = questionService.getNextQuestionNumber(num);
  res.locals.num = num;
  res.locals.answer = question[0] * question[1];
  res.locals.total = questionService.getNumberOfQuestions();

  res.render('warm-up/question', { layout: 'question-layout' });
});

router.post('/question/:number', isAuthenticated(), async function (req, res, next) {
  const num = parseInt(req.params.number, 10);
  let redirectUrl;

  if (isNaN(num)) {
    return next(new Error('Question not found'));
  }

  if (!req.session.testId) {
    return next(new Error('Missing testId'));
  }

  const questionService = new QuestionService('form-warm-up');
  const question = questionService.getQuestion(num);

  const nextQuestion = questionService.getNextQuestionNumber(num);
  if (!nextQuestion) {
    // Get warm up endDate
    // Will be refactored to a common helper func for all cases
    try {
      const pupil = await Pupil.findOne({'_id': (((res || {}).req || {}).user || {})}).exec();
      pupil.warmUpEndDate = Date.now();
      await pupil.save();
    } catch (error) {
      return next(error);
    }
    redirectUrl = '/warm-up/complete';
  } else {
    redirectUrl = '/warm-up/question/' + nextQuestion;
  }
  res.redirect(redirectUrl);
});


router.get('/intro', isAuthenticated(), function (req, res, next) {
  res.locals.pageTitle = 'Warm-up questions';
  res.render('warm-up/intro', { layout: 'question-layout' }); // Temp layout
});

/* GET the completion page */
router.get('/complete', isAuthenticated(), function (req, res, next) {
  res.locals.pageTitle = 'Warm-up questions - complete';

  // Clean up session vars from the check
  delete req.session.testId;
  delete req.session.answer;

  res.render('warm-up/complete', { layout: 'question-layout' }); // Temp layout
});

module.exports = router;
