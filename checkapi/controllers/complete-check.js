'use strict'

const asyncMiddleware = require('./asyncMiddleware')
const completeCheckService = require('../services/complete-check.service')

const completeCheck = asyncMiddleware(async (req, res, next) => {
  // TODO: JWT token authentication
  await completeCheckService.submitCheck(req.body)
  res.sendStatus(200)
  res.set("Connection", "close")
})

const readCheck = asyncMiddleware(async (req, res, next) => {
  const check = await completeCheckService.get('uuid')
  res.send(check)
})

module.exports = {
  completeCheck,
  readCheck
}
