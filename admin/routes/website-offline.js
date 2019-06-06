const express = require('express')
const router = express.Router()
const { websiteOffline } = require('../controllers/website-offline')

router.get('/', (req, res) => websiteOffline(req, res))

module.exports = router
