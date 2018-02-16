const express = require('express')
const router = express.Router()
const { checkStarted } = require('../controllers/check-started')
const winston = require('winston')

router.route('/').all((req, res) => {
  if (req.method !== 'POST') {
    winston.error(`MTC-API: ${req.url}: req.method is not POST - res.sendStatus(405) - ${JSON.stringify(req.method)} `)
    return res.sendStatus(405)
  }
  checkStarted(req, res)
  winston.info(`MTC-API: ${req.url}: request.body: ${JSON.stringify(req.body.substring(0, 199))}`)
})

module.exports = router
