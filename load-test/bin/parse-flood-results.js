'use strict'

const axios = require('axios')
const args = process.argv.slice(2)
const floodApiToken = args[0]
const floodId = args[1]

console.log(`fetching report for "${floodId}"`)

async function getFloodReport (floodId, apiToken) {
  const reportUrl = `https://api.flood.io/floods/${floodId}/report`
  const buff = Buffer.from(`${apiToken}:`)
  const b64Token = buff.toString('base64')
  const axiosConfig = {
    headers: {
      'Accept': 'application/vnd.flood.v2+json',
      'Content-Type': 'application/json',
      'Authorization': `Basic ${b64Token}`
    }
  }
  console.dir(axiosConfig)
  return axios.get(reportUrl, {}, axiosConfig)
}

getFloodReport(floodId, floodApiToken)
  .then(data => {
    console.log(JSON.stringify(data, null, ' '))
  })
  .catch(error => {
    console.error(`There was an error communicating with the flood API...\n ${error.toString()}`)
  })
