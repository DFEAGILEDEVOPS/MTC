'use strict'

const fs = require('fs')
const uuid = require('uuid/v4')
const path = require('path')

module.exports = async function (context, check) {
  context.log('found a message!')
  const id = uuid()
  const file = path.join('./', 'msgblobs', `${id}.json`)
  context.log(`saving to ${file}`)
  try {
    const string = JSON.stringify(check)
    fs.writeFileSync(file, string)
  } catch (error) {
    context.log(error)
  }
}
