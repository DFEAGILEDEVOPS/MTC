'use strict'

const axios = require('axios')
const args = process.argv.slice(2)
const floodApiToken = args[0]
const floodId = args[1]

console.log(`fetching report for "${floodId}"`)

