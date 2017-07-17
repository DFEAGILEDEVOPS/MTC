let azure = require('azure-storage')
let uuid = require('uuid/v4')

const answersTable = 'answersQueryPerfTest'
let tableSvc = azure.createTableService()

function insertBatch(entityCount) {

  tableSvc.createTableIfNotExists(answersTable, function (error, result, response) {
    //  insert 500k entities
    if (error) {
      console.error('Error creating table:%s', error)
      return
    }

    var tableBatch = new azure.TableBatch();

    for (var batchIndex = 0; batchIndex < 1000; batchIndex++) {

      process.stdout.write('inserting batch ' + batchIndex)
      process.stdout.clearLine()
      process.stdout.cursorTo(0)
      process.stdout.write('inserting entity ' + index)

      var entities = generateEntityBatch(tableBatch)

      tableSvc.executeBatch(answersTable, tableBatch, function (error, result, response) {
        if (!error) {
          console.log('%s entities inserted', entityCount)
        } else {
          console.error('Error inserting entity batch:%s', error)
        }
      })
      tableBatch.clear()
    }
  })
}

function generateEntityBatch(tableBatch) {

  for (var index = 0; index < 100; index++) {
    tableBatch.insertEntity(createPupilCheck())
  }
}

function createPupilCheck() {

  var entGen = azure.TableUtilities.entityGenerator

  var pupilCheck = {
    PartitionKey: entGen.String("123456"),
    RowKey: entGen.String("456789"),
    createdAt: entGen.DateTime(Date.now),
    logonEvent: entGen.Guid(uuid()),
    testId: entGen.Guid(uuid()),
    sessionId: entGen.Guid(uuid()),
    answers: [],
    creationDate: entGen.DateTime(Date.now),
    isElectron: false
  }

  for (var questionIndex = 0; questionIndex < 30; questionIndex++) {

    var answer = {
      pageLoadDate: entGen.DateTime(Date.now),
      answerDate: entGen.DateTime(Date.now),
      factor1: 7,
      factor2: 1,
      input: entGen.String("7"),
      registeredInputs: [
        {
          input: entGen.String("7"),
          eventType: entGen.String("touch keydown"),
          clientInputDate: entGen.DateTime(Date.now)
        }
      ]
    }
    pupilCheck.answers.push(answer)
  }

  return pupilCheck
}

module.exports = {
  insertBatch: insertBatch
}