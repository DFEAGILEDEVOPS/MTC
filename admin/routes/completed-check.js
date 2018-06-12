const express = require('express')
const router = express.Router()
const { postCheck } = require('../controllers/completed-check')
const cors = require('cors')
const corsOptions = require('../helpers/cors-options')

router.route('/').all(cors(corsOptions), (req, res) => {
  if (req.method !== 'POST') return res.sendStatus(405)
  postCheck(req, res)
})

module.exports = router
