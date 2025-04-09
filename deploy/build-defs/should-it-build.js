'use strict'

const https = require('https')
const ciEnabledLabelId = 861719997
// Example call: 'https://api.github.com/repos/dfeagiledevops/mtc/pulls/557'
const pullRequestId = process.argv[2]

if (!pullRequestId) {
  console.log('Missing argument: pull request id')
  process.exit(1)
}

const options = {
  hostname: 'api.github.com',
  path: `/repos/dfeagiledevops/mtc/pulls/${pullRequestId}`,
  method: 'GET',
  headers: {
    'User-Agent': 'node/https'
  }
}

const authToken = process.env.GITHUB_PAT
options.headers.Authorization = `token ${authToken}`

const parseResponse = (res) => {
  let labels
  let payload
  try {
    try {
      payload = JSON.parse(res)
    } catch (error) {
      console.error(`error parsing response:${error.message}`)
      process.exit(1)
    }
    if (!payload) {
      console.error('null payload')
      process.exit(1)
    }
    labels = payload.labels
    if (!labels || labels.length === 0) {
      console.log(`no labels found attached to PR ${pullRequestId}`)
      console.log(payload)
      process.exit(1)
    }
  } catch (err) {
    console.error(`error parsing labels for PR ${pullRequestId}`)
    console.log(payload)
    console.error(err)
    process.exit(1)
  }
  const ciEnabledLabel = labels.find(item => item.id === ciEnabledLabelId)
  if (ciEnabledLabel) {
    console.log(`CI enabled label found on PR ${pullRequestId}`)
    process.exit(0)
  }
  console.log(`CI Enabled label not found on PR ${pullRequestId}`)
  console.log(payload)
  process.exit(1)
}

https.get(options, (response) => {
  let data = ''

  response.on('data', (chunk) => {
    data += chunk
  })

  response.on('end', () => {
    parseResponse(data)
  })
}).on('error', (err) => {
  console.error('Error: ' + err.message)
})
