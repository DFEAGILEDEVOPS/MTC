const express = require('express')
const router = express.Router()
const { setPupilFeedback } = require('../controllers/pupil-feedback')
const winston = require('winstonLogger')

router.route('/').all((req, res) => {
  if (req.method !== 'POST') {
    winston.error(`MTC-API:${req.url}: req.method is not POST - res.sendStatus(405) - ${JSON.stringify(req.method)} `)
    return res.sendStatus(405)
  }
  setPupilFeedback(req, res)
  winston.info(`MTC-API: ${req.url}: request.body: ${JSON.stringify(req.body)}`)
})

module.exports = router
