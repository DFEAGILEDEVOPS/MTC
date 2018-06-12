const express = require('express')
const router = express.Router()
const { getQuestions } = require('../controllers/questions')
const cors = require('cors')
const corsOptions = require('../helpers/cors-options')

router.route('/').all(cors(corsOptions), (req, res) => {
  if (req.method !== 'POST') return res.sendStatus(405)
  getQuestions(req, res)
})

module.exports = router
