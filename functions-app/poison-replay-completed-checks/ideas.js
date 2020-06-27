'use strict'

const fs = require('fs')
const { v4: uuid } = require('uuid')
const path = require('path')
const compressionService = require('../../functions/lib/compression.service')

module.exports = async function (context, check) {
  let version
  let message
  if (check.version && check.version === '2') {
    version = 2
    context.log('decompressing v2 message')
    message = compressionService.decompress(check.archive)
  } else {
    version = 1
    message = check
  }
  const id = uuid()
  const file = path.join('./', `v${version}`, `${id}.json`)
  context.log(`saving to ${file}`)
  try {
    const jsonString = JSON.stringify(message)
    fs.writeFileSync(file, jsonString)
  } catch (error) {
    context.log(error)
  }
}

/*
1. understand which schools are affected
2.
*/
