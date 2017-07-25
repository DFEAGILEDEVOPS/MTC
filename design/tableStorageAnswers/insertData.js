let azure = require('azure-storage')
let uuid = require('uuid/v4')
let readline = require('readline')
let util = require('util')
let async = require('async')

const answersTable = 'answersQueryPerfTest'
let tableSvc = azure.createTableService()

function insertData(done) {

  tableSvc.createTableIfNotExists(answersTable, function (error, result, response) {
    if (error) {
      done(error)
    } else {
      var batches = createBatches()
      async.eachOf(batches, function (batch, index, callback) {
        tableSvc.executeBatch(answersTable, batch, function (error, result, response) {
          if (error) {
            return callback(error)
          }
          else {
            console.log('batch %s inserted successfully', index)
            callback()
          }
        })
      }, function (err) {
        if (err) {
          console.error(err.message)
          done(err)
        } else {
          done()
        }
      })
    }
  })
}

module.exports = { 
  insertBatches : insertData,
  selectPupil : undefined,
  selectSchool : undefined
}

function createBatches() {

  var batches = [];
  var entGen = azure.TableUtilities.entityGenerator

  for (var batchIndex = 0; batchIndex < 20; batchIndex++) {

    var batch = new azure.TableBatch()
    var partitionKey = new Date().getTime().toString()
    var rowKeySeed = new Date().getTime()

    for (var index = 0; index < 99; index++) {
      rowKeySeed++
      var check = createPupilCheck(partitionKey, rowKeySeed.toString())
      batch.insertEntity(check)
    }
    batches.push(batch)
  }
  return batches;
}

function createPupilCheck(partitionKey, rowKey) {

  let entGen = azure.TableUtilities.entityGenerator
  //var rowKey = new Date().getTime().toString()

  var pupilCheck = {
    PartitionKey: entGen.String(partitionKey),
    RowKey: entGen.String(rowKey),
    createdAt: entGen.DateTime(new Date()),
    logonEvent: entGen.Guid(uuid()),
    testId: entGen.Guid(uuid()),
    sessionId: entGen.Guid(uuid()),
    creationDate: entGen.DateTime(new Date()),
    isElectron: entGen.Boolean(false)
  }

  var answers = [];
  for (var questionIndex = 0; questionIndex < 30; questionIndex++) {

    var answer = {
      pageLoadDate: entGen.DateTime(new Date()),
      answerDate: entGen.DateTime(new Date()),
      factor1: entGen.Int32(7),
      factor2: entGen.Int32(1),
      input: entGen.String("7"),
      registeredInputs: [
        {
          input: entGen.String("7"),
          eventType: entGen.String("touch keydown"),
          clientInputDate: entGen.DateTime(new Date())
        }
      ]
    }
    answers.push(answer)
  }

  pupilCheck.answers = JSON.stringify(answers)

  return pupilCheck
}

function updateBatchProgress(batch) {
  readline.clearLine(process.stdout, 0)
  readline.cursorTo(process.stdout, 0)
  let text = `processing batch... ${batch}`
  process.stdout.write(text)
}

function insertOne(done) {

  var pupilCheck = createPupilCheck()
  console.dir(pupilCheck)

  tableSvc.insertEntity(answersTable, pupilCheck, function (error, result, response) {
    if (error) {
      done(error)
    } else {
      done()
    }
  })
}