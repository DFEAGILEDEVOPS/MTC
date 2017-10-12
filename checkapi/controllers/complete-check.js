'use strict'

const asyncMiddleware = require('./asyncMiddleware')
const completeCheckService = require('../services/complete-check.service')

const completeCheck = asyncMiddleware(async (req, res, next) => {
  // TODO: JWT token authentication
  await completeCheckService.submitCheck(req.body)
  res.sendStatus(200)
})

module.exports = {
  completeCheck
}
