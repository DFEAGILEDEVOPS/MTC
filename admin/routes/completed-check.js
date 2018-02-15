const express = require('express')
const router = express.Router()
const moment = require('moment')
const { postCheck } = require('../controllers/completed-check')
const winstonLogger = require('./../winstonLogger')

router.route('/').all((req, res) => {
  const apiLogger = winstonLogger.apiLogger()
  apiLogger.info(`MTC-API: completed-started (${moment()}) reached`)
  if (req.method !== 'POST') {
    apiLogger.info(`MTC-API: completed-started: req.method is not POST - res.sendStatus(405) - ${JSON.stringify(req.method)} `)
    return res.sendStatus(405)
  }
  postCheck(req, res)
  apiLogger.info(`MTC-API: completed-started: request.body: ${JSON.stringify(req.body)}`)
  apiLogger.info(`MTC-API: completed-started: response: ${JSON.stringify(res)}`)
})

module.exports = router
