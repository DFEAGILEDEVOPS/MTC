const express = require('express')
const router = express.Router()
const moment = require('moment')
const { getQuestions } = require('../controllers/questions')
const winstonLogger = require('./../winstonLogger')

router.route('/').all((req, res) => {
  const apiLogger = winstonLogger.apiLogger()
  apiLogger.info(`MTC-API: questions (${moment()}) reached`)
  if (req.method !== 'POST') {
    apiLogger.info(`MTC-API: questions: req.method is not POST - res.sendStatus(405) - ${JSON.stringify(req.method)}`)
    return res.sendStatus(405)
  }
  getQuestions(req, res)
  apiLogger.info(`MTC-API: questions: request.body: ${JSON.stringify(req.body)}`)
  apiLogger.info(`MTC-API: questions: response: ${JSON.stringify(res)}`)
})

module.exports = router
