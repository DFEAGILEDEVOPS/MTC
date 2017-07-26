const express = require('express')
const router = express.Router()
const { getQuestions } = require('../controllers/questions')

router.post('/', (req, res) => getQuestions(req, res))

module.exports = router
