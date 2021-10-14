'use strict'

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
const uuid = require('uuid/v4')
const config = require('../config')
const { TableClient } = require('@azure/data-tables')
const tableName = 'preparedCheck'
const tableClient = TableClient.fromConnectionString(config.AzureStorage.connectionString, tableName)
// const tokenPayload = require('../scenarios/data/tokens.json')
// const questionPayload = require('../scenarios/data/questions.json')

const entriesToCreate = process.env.LOAD_COUNT || 1000
const schoolCount = entriesToCreate / 30
let importCount = 0

const generateEntity = (schoolPin, pupilPin) => {
  const config = {
    questionTime: 6,
    loadingTime: 3,
    speechSynthesis: false,
    audibleSounds: false,
    inputAssistance: false,
    numpadRemoval: false,
    fontSize: true,
    colourContrast: true,
    questionReader: false,
    practice: true
  }
  const pupil = {
    firstName: '6',
    lastName: 'Pupil',
    dob: '1 January 2000',
    checkCode: 'BEB57F81-1820-483F-9550-B7A9EA610092'
  }
  const school = {
    id: 18607,
    name: 'Pauls Primary School'
  }
  return {
    partitionKey: schoolPin.toString(),
    rowKey: pupilPin.toString(),
    checkCode: uuid().toString(),
    collectedAt: null,
    config: config,
    isCollected: 'false',
    createdAt: 'a date',
    updatedAt: 'a date',
    pinExpiresAt: 'a date',
    pupil: pupil,
    school: school,
    tokens: [], // JSON.stringify(tokenPayload),
    questions: [], // JSON.stringify(questionPayload),
    pupilId: 123,
    schoolId: 456
  }
}

const importData = async () => {
  console.log(`creating ${schoolCount} schools with 30 pupils per school`)
  let schoolPin = 11100111
  for (let schoolIndex = 0; schoolIndex < schoolCount; schoolIndex++) {
    let pupilPin = 1000
    const createEntityPromises = []
    for (let pupilIndex = 0; pupilIndex < 30; pupilIndex++) {
      const entity = generateEntity(schoolPin, pupilPin)
      createEntityPromises.push(tableClient.createEntity(entity))
      pupilPin++
    }
    schoolPin++
    await Promise.all(createEntityPromises)
    importCount++
  }
}

async function main () {
  console.log('deleting tables')
  await tableClient.deleteTable()
  console.log('creating tables')
  await tableClient.createTable()
  console.log('importing data')
  await importData()
}

main()
  .then(() => {
    console.log(`${importCount} schools imported.`)
  },
  (error) => {
    console.error(error)
  })
  .catch(error => {
    console.error('Caught error: ' + error.message)
  })
