'use strict'

const https = require('https')
const ciEnabledLabelId = 861719997
// 'https://api.github.com/repos/dfeagiledevops/mtc/pulls/557'
const pullRequestId = process.argv[2] || 557

const options = {
  hostname: 'api.github.com',
  path: `/repos/dfeagiledevops/mtc/pulls/${pullRequestId}`,
  method: 'GET',
  headers: {
    'User-Agent': 'node/https'
  }
}

const parseResponse = (res) => {
  let labels
  try {
    labels = JSON.parse(res).labels
    if (!labels || labels.length === 0) {
      console.log('no labels found attached to PR')
      process.exit(1)
    }
  } catch (err) {
    console.error('error parsing labels')
    console.error(err)
    process.exit(1)
  }
  const ciEnabledLabel = labels.find(item => item.id === ciEnabledLabelId)
  if (ciEnabledLabel) {
    console.log('CI enabled label found on pull request ', pullRequestId)
    process.exit(0)
  }
  console.log('CI Enabled label not found on pull request', pullRequestId)
  process.exit(1)
}

https.get(options, (response) => {
  let data = ''

  // A chunk of data has been received.
  response.on('data', (chunk) => {
    data += chunk
  })

  // The whole response has been received. Print out the result.
  response.on('end', () => {
    parseResponse(data)
  })
}).on('error', (err) => {
  console.error('Error: ' + err.message)
})
