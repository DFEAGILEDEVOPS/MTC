'use strict'

const express = require('express')
const router = express.Router()

const isAuthenticated = require('../authentication/middleware')

const {
  getStart,
  getConfirm,
  getConnection,
  getQuestion,
  postQuestion,
  getComplete,
  getFeedback,
  postFeedback,
  getFeedbackThanks,
  getFeedbackSent,
  getSignInSuccess,
  postStartCheck } = require('../controllers/mtc-check')

/* GET start page. */
router.get('/start', isAuthenticated(), (req, res) => getStart(req, res))
/* GET confirmation page. */
router.get('/confirm', isAuthenticated(), (req, res) => getConfirm(req, res))
/* GET speedcheck page. */
router.get('/connection', isAuthenticated(), (req, res) => getConnection(req, res))
/* GET the questions */
router.get('/question/:number', isAuthenticated(), (req, res, next) => getQuestion(req, res, next))
/* GET the questions */
router.post('/question/:number', isAuthenticated(), (req, res, next) => postQuestion(req, res, next))
/* GET the completion page */
router.get('/complete', isAuthenticated(), (req, res, next) => getComplete(req, res, next))
/* GET the feedback form */
router.get('/feedback', isAuthenticated(), (req, res) => getFeedback(req, res))
/* POST from the feedback form */
router.post('/feedback', (req, res, next) => postFeedback(req, res, next))
/* GET the thank you form */
router.get('/feedback-thanks', (req, res) => getFeedbackThanks(req, res))
/* GET feedback already received */
router.get('/feedback-sent', (req, res) => getFeedbackSent(req, res))
/* Sign in success */
router.get('/sign-in-success', isAuthenticated(), (req, res) => getSignInSuccess(req, res))
router.post('/start-check', isAuthenticated(), (req, res, next) => postStartCheck(req, res, next))

module.exports = router
