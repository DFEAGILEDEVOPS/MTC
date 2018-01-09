'use strict'

const { verify } = require('../services/jwt.service')
const checkDataService = require('../services/data-access/check.data.service')
const apiResponse = require('./api-response')
const pupilFeedbackDataService = require('../services/data-access/pupil-feedback.data.service')

// TODO: add logging for all error paths

const setPupilFeedback = async (req, res, next) => {
  let check
  const {
    inputType,
    satisfactionRating,
    comments,
    checkCode,
    accessToken } = req.body

  if (!inputType || !satisfactionRating || !checkCode || !accessToken) {
    return apiResponse.badRequest(res)
  }

  try {
    await verify(accessToken)
  } catch (err) {
    return apiResponse.unauthorised(res)
  }

  try {
    check = await checkDataService.sqlFindOneByCheckCode(checkCode)
    if (!check) {
      return apiResponse.badRequest(res)
    }
  } catch (error) {
    return apiResponse.serverError(res)
  }

  const pupilFeedbackData = {
    inputType: inputType,
    satisfactionRating: satisfactionRating,
    comments: comments,
    checkId: check._id
  }

  try {
    await pupilFeedbackDataService.create(pupilFeedbackData)
    apiResponse.sendJson(res, 'Pupil feedback saved', 201)
  } catch (error) {
    apiResponse.serverError(res)
  }
}

module.exports = {
  setPupilFeedback
}
