let azure = require('azure-storage')
let tableSvc = azure.createTableService()
const answersTable = 'answersQueryPerfTest'
let tableBatch = azure.tableBatch()

tableSvc.createTableIfNotExists(answersTable, function (error, result, response) {
    //  insert 500k entities
    if (error) {
        console.error('Error creating table:%s', error)
    }

    var entities = generateEntities(1000)
    insertEntities(entities)
    console.log('done')

})

function generateEntities(count) {
    var entGen = azure.TableUtilities.entityGenerator
    var entities = []
    for (var index = 0; index < count; index++) {

        var answer = {
            PartitionKey: entGen.String('hometasks'),
            RowKey: entGen.String('1'),
            description: entGen.String('take out the trash'),
            dueDate: entGen.DateTime(Date.now)
        }
        entities.push(answer)
    }
    return entities
}

function insertEntities(entities) {
    tableSvc.insertEntity(answersTable, task, function (error, result, response) {
        if (!error) {
            // Entity inserted
        }
    })
}
