const express = require('express')
const router = express.Router()
// const isAuthenticated = require('../authentication/middleware')
const { getQuestions } = require('../controllers/questions')

router.post('/', (req, res, next) => getQuestions(req, res, next))

module.exports = router
