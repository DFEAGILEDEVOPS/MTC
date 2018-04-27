'use strict'

const apiResponse = {}

apiResponse.unauthorised = function (res) {
  this.setJsonHeader(res)
  return res.status(401).json({error: 'Unauthorised'})
}

apiResponse.badRequest = function (res) {
  this.setJsonHeader(res)
  return res.status(400).json({error: 'Bad request'})
}

apiResponse.serverError = function (res) {
  this.setJsonHeader(res)
  return res.status(500).json({error: 'Server error'})
}

apiResponse.setJsonHeader = function (res) {
  res.setHeader('Content-Type', 'application/json')
}

apiResponse.sendJson = function (res, obj, code = 200) {
  this.setJsonHeader(res)
  res.status(code).json(obj)
}

module.exports = apiResponse
