'use strict'

const { getCommitId, getBuildNumber } = require('../helpers/healthcheck')

/* Health check */
async function getPing (req, res) {
  // get build number from /build.txt
  // get git commit from /commit.txt
  let buildNumber = 'NOT FOUND'
  let commitId = 'NOT FOUND'
  try {
    buildNumber = await getBuildNumber()
  } catch {
    // do nothing
  }

  try {
    commitId = await getCommitId()
  } catch {
    // do nothing
  }

  res.setHeader('Content-Type', 'application/json')
  const obj = {
    Build: buildNumber,
    Commit: commitId,
    CurrentServerTime: Date.now()
  }
  return res.status(200).send(obj)
}

module.exports = getPing
