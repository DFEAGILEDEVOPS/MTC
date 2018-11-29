'use strict'

require('dotenv').config()
const azure = require('azure-storage')
const uuid = require('uuid/v4')
const tableService = azure.createTableService()
const tokenPayload = require('../scenarios/data/tokens.json')
const questionPayload = require('../scenarios/data/questions.json')

const entriesToCreate = process.env.LOAD_COUNT || 500
const schoolCount = entriesToCreate / 30

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
    PartitionKey: {
      '_': schoolPin.toString()
    },
    RowKey: {
      '_': pupilPin.toString()
    },
    checkCode: {
      '_': uuid().toString()
    },
    collectedAt: null,
    config: JSON.stringify(config),
    isCollected: 'false',
    createdAt: 'a date',
    updatedAt: 'a date',
    pinExpiresAt: 'a date',
    pupil: JSON.stringify(pupil),
    school: JSON.stringify(school),
    tokens: JSON.stringify(tokenPayload),
    questions: JSON.stringify(questionPayload),
    pupilId: 123,
    schoolId: 456
  }
}

console.log(`creating ${schoolCount} schools with 30 pupils per school`)

for (let schoolIndex = 0; schoolIndex < schoolCount; schoolIndex++) {
  let schoolPin = 11100111
  let pupilPin = 1000
  const pupilBatch = new azure.TableBatch()
  for (let pupilIndex = 0; pupilIndex < 30; pupilIndex++) {
    const entity = generateEntity(schoolPin, pupilPin)
    pupilBatch.insertEntity(entity)
    pupilPin++
  }
  tableService.executeBatch('preparedCheck', pupilBatch, (error, result, response) => {
    if (error) {
      console.error('error executing batch:')
      console.dir(error)
      console.log('-------------result-------------------')
      console.dir(result)
      console.log('-------------response-----------------')
      console.dir(response)
      console.log('-------------details------------------')
      console.dir(response.body)
    } else {
      console.log(`school ${schoolPin} added successfully`)
    }
  })
  schoolPin++
}