const express = require('express')
const router = express.Router()
const { postCheck } = require('../controllers/completed-check')

router.route('/').all((req, res) => {
  if (req.method !== 'POST') return res.sendStatus(405)
  postCheck(req, res)
})

module.exports = router
