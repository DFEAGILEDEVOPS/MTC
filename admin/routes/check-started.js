const express = require('express')
const router = express.Router()
const { preCheck } = require('../controllers/check-started')

router.route('/').all((req, res) => {
  if (req.method !== 'POST') return res.sendStatus(405)
  preCheck(req, res)
})

module.exports = router
