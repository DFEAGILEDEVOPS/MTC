'use strict'

const fs = require('fs')
const uuid = require('uuid/v4')
const path = require('path')
const compressionService = require('../../functions/lib/compression.service')

module.exports = async function (context, check) {
  let version
  let message
  if (check.version && check.version === '2') {
    version = 2
    message =
  } else {
    version = 1
  }
  context.log(`processing v${version} message`)
  const id = uuid()
  const file = path.join('./', `v${version}`, `${id}.json`)
  context.log(`saving to ${file}`)
  try {
    const string = JSON.stringify(check)
    fs.writeFileSync(file, string)
  } catch (error) {
    context.log(error)
  }
}
