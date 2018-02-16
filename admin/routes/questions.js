const express = require('express')
const router = express.Router()
const { getQuestions } = require('../controllers/questions')
const winston = require('winston')

router.route('/').all((req, res) => {
  winston.info(`MTC-API: ${req.url} reached`)
  if (req.method !== 'POST') {
    winston.error(`MTC-API: ${req.url}: req.method is not POST - res.sendStatus(405) - ${JSON.stringify(req.method)}`)
    return res.sendStatus(405)
  }
  getQuestions(req, res)
  winston.info(`MTC-API: ${req.url}: request.body: ${JSON.stringify(req.body)}`)
})

module.exports = router
