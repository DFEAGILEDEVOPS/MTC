let azure = require('azure-storage')
let uuid = require('uuid/v4')
let readline = require('readline')
let util = require('util')
let async = require('async')

const answersTable = 'answersQueryPerfTest'
let tableSvc = azure.createTableService()


function insertOne(done) {

  var entGen = azure.TableUtilities.entityGenerator

  var pupilCheck = {
    PartitionKey: entGen.String(Date.now().toString()),
    RowKey: entGen.String(Date.now().toString()),
    createdAt: Date.now(),
    logonEvent: entGen.Guid(uuid()),
    isElectron: entGen.Boolean(false)
  }

  console.dir(pupilCheck)

  tableSvc.insertEntity(answersTable, pupilCheck, function (error, result, response) {
    if (error) {
      done(error)
    } else {
      done()
    }
  })
}

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
            console.log('batch % inserted successfully', index)
            callback()
          }
        })
      }, function (err) {
        if (err) console.error(err.message)
        done(err)
      })
      done()
    }
  })
}

module.exports = insertData

function insertOld() {

  let createTable = util.promisify(tableSvc.createTableIfNotExists, null);
  let executeBatch = util.promisify(tableSvc.executeBatch)

  createTable(answersTable)
    .then(async function () {
      var batches = createBatches()
      var index = 1;
      for (let batch of batches) {
        updateBatchProgress(index++)
        await executeBatch(answersTable, batch)
      }
    },
    (err) => {
      console.log('error:%', err)
    })
    .catch((err) => {
      console.log('error:%', err)
    })
}

function createBatches() {

  var batches = [];
  var entGen = azure.TableUtilities.entityGenerator

  for (var batchIndex = 0; batchIndex < 5; batchIndex++) {

    var batch = new azure.TableBatch()
    var pk = new Date().getTime().toString()
    for (var index = 0; index < 99; index++) {
      var check = createPupilCheck()
      check.PartitionKey = entGen.String(pk)
      batch.insertEntity(check)
    }
    batches.push(batch)
  }
  return batches;
}

function createPupilCheck() {

  var entGen = azure.TableUtilities.entityGenerator

  var pupilCheck = {
    PartitionKey: entGen.String(new Date().getTime().toString()),
    RowKey: entGen.String(new Date().getTime().toString()),
    createdAt: Date.now(),
    logonEvent: entGen.Guid(uuid()),
    testId: entGen.Guid(uuid()),
    sessionId: entGen.Guid(uuid()),
    answers: [],
    creationDate: Date.now(),
    isElectron: entGen.Boolean(false)
  }

  for (var questionIndex = 0; questionIndex < 30; questionIndex++) {

    var answer = {
      pageLoadDate: Date.now(),
      answerDate: Date.now(),
      factor1: entGen.Int32(7),
      factor2: entGen.Int32(1),
      input: entGen.String("7"),
      registeredInputs: [
        {
          input: entGen.String("7"),
          eventType: entGen.String("touch keydown"),
          clientInputDate: Date.now()
        }
      ]
    }
    pupilCheck.answers.push(answer)
  }

  return pupilCheck
}

function updateBatchProgress(batch) {
  readline.clearLine(process.stdout, 0)
  readline.cursorTo(process.stdout, 0)
  let text = `processing batch... ${batch}`
  process.stdout.write(text)
}