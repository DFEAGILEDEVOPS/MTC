'use strict'

/*
NO LONGER USED.
generates sequenced pupil and school pins as a json array.
Created for testing the pupil API in isolation from loader.io.
*/

const path = require('path')
const fs = require('fs')
const globalDotEnvFile = path.join(__dirname, '..', '..', '.env')

try {
  if (fs.existsSync(globalDotEnvFile)) {
    console.log('globalDotEnvFile found', globalDotEnvFile)
    require('dotenv').config({ path: globalDotEnvFile })
  } else {
    console.log('No .env file found at project root')
  }
} catch (error) {
  console.error(error)
}

const entriesToCreate = process.env.LOAD_COUNT || 1000
const schoolCount = entriesToCreate / 30
const fs = require('fs')

const json = {
  keys: ['schoolPin', 'pupilPin'],
  values: []
}

console.log(`creating ${schoolCount} schools with 30 pupils per school`)
let schoolPin = 11100111
for (let schoolIndex = 0; schoolIndex < schoolCount; schoolIndex++) {
  let pupilPin = 1000
  for (let pupilIndex = 0; pupilIndex < 30; pupilIndex++) {
    json.values.push([schoolPin, pupilPin])
    pupilPin++
  }
  schoolPin++
}

fs.writeFile('pupil-data.json', JSON.stringify(json), 'utf8', () => {
  console.log('file written to disk')
})
