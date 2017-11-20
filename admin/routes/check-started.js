const express = require('express')
const router = express.Router()
const { checkStarted } = require('../controllers/check-started')

router.route('/').all((req, res) => {
  if (req.method !== 'POST') return res.sendStatus(405)
  checkStarted(req, res)
})

module.exports = router
