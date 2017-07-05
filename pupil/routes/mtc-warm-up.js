'use strict'

const express = require('express')
const router = express.Router()
const isAuthenticated = require('../authentication/middleware')
const {
  getIntro,
  getQuestion,
  postQuestion,
  getComplete } = require('../controllers/mtc-warmup')

/* Warm-up questions */
/* GET Intro */
router.get('/intro', isAuthenticated(), (req, res) => getIntro(req, res))
/* GET the questions */
router.get('/question/:number', isAuthenticated(), (req, res, next) => getQuestion(req, res, next))
router.post('/question/:number', isAuthenticated(), (req, res, next) => postQuestion(req, res, next))
/* GET the completion page */
router.get('/complete', isAuthenticated(), (req, res) => getComplete(req, res))

module.exports = router
