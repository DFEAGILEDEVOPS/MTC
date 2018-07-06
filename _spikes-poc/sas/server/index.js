'use strict'

require('dotenv').config()
const express = require('express')
const app = express()
const sasGenerator = require('./generate-sas-token')
const config = require('./config')
const cors = require('cors')

app.use(cors())

app.post('/auth', (req, res) => {
  const token = sasGenerator()
  res.send(token)
  res.status(200)
})

app.listen(config.Port, () => {
  console.log(`Listening... http://localhost:${config.Port}/auth`)
})
