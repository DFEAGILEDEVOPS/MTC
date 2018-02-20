const winston = require('winston')

const { verify } = require('../services/jwt.service')
const checkCompleteService = require('../services/check-complete.service')
const apiResponse = require('./api-response')

/**
 * Posts answers, audit and pupil input data to the database
 * @param req
 * @param res
 * @returns { object }
 */

const postCheck = async (req, res) => {
  const {
    answers,
    inputs,
    session,
    audit,
    questions,
    config,
    pupil,
    school,
    access_token,
    feedback,
    device
  } = req.body
  if (!answers || !audit || !inputs) return apiResponse.badRequest(res)

  // User verification
  try {
    await verify(access_token)
  } catch (error) {
    return apiResponse.unauthorised(res)
  }

  try {
    await checkCompleteService.completeCheck({
      data: {
        access_token,
        answers,
        audit,
        config,
        feedback,
        inputs,
        pupil,
        questions,
        school,
        session,
        device
      }
    })
  } catch (error) {
    winston.error(error)
    return apiResponse.serverError(res)
  }

  return apiResponse.sendJson(res, 'OK', 201)
}

module.exports = {
  postCheck
}
