const express = require('express')
const router = express.Router()
const { postCheck } = require('../controllers/completed-check')
const winston = require('winston')

router.route('/').all((req, res) => {
  if (req.method !== 'POST') {
    winston.error(`MTC-API: ${req.url}: req.method is not POST - res.sendStatus(405) - ${JSON.stringify(req.method)} `)
    return res.sendStatus(405)
  }
  postCheck(req, res)
  winston.info(`MTC-API: ${req.url}: request.body: ${JSON.stringify(req.body && req.body.length > 0 ? req.body.substring(0, 199) : '')}`)
})

module.exports = router
