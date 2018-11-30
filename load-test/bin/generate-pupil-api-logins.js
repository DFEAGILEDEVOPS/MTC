'use strict'

require('dotenv').config()

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
