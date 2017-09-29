const CompletedChecks = require('../models/completed-checks')
const { verify } = require('../services/jwt.service')

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
    feedback
    } = req.body
  if (!answers || !audit || !inputs) return apiResponse.badRequest(res)

  // User verification
  try {
    await verify(access_token)
  } catch (err) {
    return apiResponse.unauthorised(res)
  }
  // store data to db
  const completedData = new CompletedChecks({
    data: {
      answers,
      inputs,
      session,
      audit,
      questions,
      config,
      pupil,
      school,
      access_token,
      feedback
    },
    receivedByServerAt: Date.now()
  })
  try {
    await completedData.save()
  } catch (err) {
    return apiResponse.serverError(res)
  }
  return apiResponse.sendJson(res, 'OK', 201)
}

module.exports = {
  postCheck
}
