const CompletedChecks = require('../models/completed-checks')
const { verify } = require('../services/jwt-service')

/**
 * Posts answers, audit and pupil input data to the database
 * @param req
 * @param res
 * @returns { object }
 */

const postCheck = async (req, res) => {
  const { answers, audit, inputs, access_token } = req.body
  if (!answers || !audit || !inputs) return res.status(400).json({error: 'Bad Request'})
  // User verification
  try {
    await verify(access_token)
  } catch (err) {
    return res.status(401).json({error: 'Unauthorised'})
  }
  // store data to db
  const completedData = new CompletedChecks({
    data: {
      answers,
      audit,
      inputs
    }
  })
  try {
    await completedData.save()
  } catch (err) {
    return res.status(500).json({error: 'Server Error'})
  }
  return res.sendStatus(201)
}

module.exports = {
  postCheck
}
