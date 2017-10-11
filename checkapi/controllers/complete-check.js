'use strict'

const completeCheckService = require('../services/complete-check.service')

const completeCheck = (req, res, next) => {
  // TODO: JWT token authentication
  // TODO: submit to backend
  completeCheckService.submitCheck(req.body)
  res.sendStatus(200)
}

module.exports = {
  completeCheck
}
