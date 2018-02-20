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
    access_token,
    answers,
    audit,
    config,
    device,
    feedback,
    inputs,
    pupil,
    questions,
    school,
    session
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
        device,
        feedback,
        inputs,
        pupil,
        questions,
        school,
        session
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
