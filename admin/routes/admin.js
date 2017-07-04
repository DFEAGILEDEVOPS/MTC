'use strict'

const express = require('express')
const router = express.Router()
const school = require('./school')
const pupil = require('./pupil')

school(router)
pupil(router)

module.exports = router
