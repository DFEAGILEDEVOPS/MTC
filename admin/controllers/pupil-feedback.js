const PupilFeedback = require('../models/pupil-feedback')
const { verify } = require('../services/jwt-service')

const setPupilFeedback = async (req, res, next) => {
  const {
    inputType,
    satisfactionRating,
    comments,
    sessionId,
    accessToken } = req.body

  if (!inputType || !satisfactionRating || !sessionId) {
    return res.status(400).json({error: 'Bad Request'})
  }

  try {
    await verify(accessToken)
  } catch (err) {
    return res.status(401).json({error: 'Unauthorised'})
  }

  const pupilFeedback = new PupilFeedback({
    inputType: inputType,
    satisfactionRating: satisfactionRating,
    comments: comments,
    sessionId: sessionId
  })

  try {
    await pupilFeedback.save()
    res.status(201).json('Pupil feedback saved')
  } catch (error) {
    console.log('Error saving pupil feedback', error)
    res.status(500).json({error: 'Server Error'})
  }
}

module.exports = {
  setPupilFeedback
}
