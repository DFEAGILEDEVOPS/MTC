const express = require('express')
const router = express.Router()
const { setPupilFeedback } = require('../controllers/pupil-feedback')

router.route('/').all((req, res) => {
  if (req.method !== 'POST') return res.sendStatus(405)
  setPupilFeedback(req, res)
})

module.exports = router
