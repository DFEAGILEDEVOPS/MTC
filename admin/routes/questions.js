const express = require('express')
const router = express.Router()
const { getQuestions } = require('../controllers/questions')

router.route('/').all((req, res) => {
  if (req.method !== 'POST') return res.sendStatus(405)
  getQuestions(req, res)
})

module.exports = router
