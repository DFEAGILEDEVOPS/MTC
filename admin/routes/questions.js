const express = require('express')
const router = express.Router()
const { getQuestions } = require('../controllers/questions')

router.route('/').get().all((req, res) => res.sendStatus(405))
router.post('/', (req, res) => getQuestions(req, res))

module.exports = router
