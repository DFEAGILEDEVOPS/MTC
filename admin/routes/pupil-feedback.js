const express = require('express')
const router = express.Router()
const { setPupilFeedback } = require('../controllers/pupil-feedback')
const cors = require('cors')
const corsOptions = require('../helpers/cors-options')

router.route('/').all(cors(corsOptions), (req, res) => {
  if (req.method !== 'POST') return res.sendStatus(405)
  setPupilFeedback(req, res)
})

module.exports = router
