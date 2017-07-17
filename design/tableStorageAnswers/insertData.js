let azure = require('azure-storage')
let uuid = require('uuid/v4')

const answersTable = 'answersQueryPerfTest'
let tableSvc = azure.createTableService()
let tableBatch = azure.tableBatch()

function insertBatch(entityCount) {

  tableBatch.createTableIfNotExists(answersTable, function (error, result, response) {
    //  insert 500k entities
    if (error) {
      console.error('Error creating table:%s', error)
      return
    }

    var entities = generateEntities(entityCount)
    tableBatch.insertBatch(entities)
    tableSvc.executeBatch(answersTable, tableBatch, function (error, result, response) {
      if (!error) {
        console.log('%s entities inserted', entityCount)
      } else {
        console.error('Error inserting entity batch:%s', error)
      }
    })
  })

}

function generateEntities(count) {

  var entGen = azure.TableUtilities.entityGenerator
  var thousands = count / 1000;
  if (thousands === 0) {
    console.error('batch count must be in thousands')
    return
  }

  var entities = []


  for (var index = 0; index < count; index++) {

    var pupilCheck = {
      PartitionKey: entGen.String(123456),
      RowKey: entGen.String(456789),
      createdAt: entGen.DateTime(Date.now),
      logonEvent: entGen.Guid(uuid()),
      testId: entGen.Guid(uuid()),
      sessionId: entGen.Guid(uuid()),
      answers: [],
      creationDate: entGen.DateTime(Date.now),
      isElectron: false
    }

    for (var question = 0; question < 30; question++) {

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

    entities.push(pupilCheck)
  }
  return entities
}