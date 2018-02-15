const express = require('express')
const router = express.Router()
const moment = require('moment')
const { checkStarted } = require('../controllers/check-started')
const winstonLogger = require('./../winstonLogger')

router.route('/').all((req, res) => {
  const apiLogger = winstonLogger.apiLogger()
  apiLogger.info(`MTC-API: check-started (${moment()}) reached`)
  if (req.method !== 'POST') {
    apiLogger.error(`MTC-API: check-started: req.method is not POST - res.sendStatus(405) - ${JSON.stringify(req.method)} `)
    return res.sendStatus(405)
  }
  checkStarted(req, res)
  apiLogger.info(`MTC-API: check-started: request.body: ${JSON.stringify(req.body)}`)
  apiLogger.info(`MTC-API: check-started: response: ${JSON.stringify(res)}`)
})

module.exports = router
