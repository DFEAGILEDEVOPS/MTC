'use strict'

require('dotenv').config()
const express = require('express')
const app = express()
const sasGenerator = require('./generate-sas-token')
const config = require('./config')

app.post('/auth', (req, res) => {
  const token = sasGenerator()
  res.send(token)
  res.status(200)
})

app.listen(config.Port, () => {
  console.log('http://localhost:' + config.port)
})
