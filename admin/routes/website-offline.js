const express = require('express')
const router = express.Router()
const { websiteOffline } = require('../controllers/website-offline')

router.get('/', websiteOffline)

module.exports = router
