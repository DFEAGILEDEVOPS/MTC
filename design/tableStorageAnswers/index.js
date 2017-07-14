let azure = require('azure-storage')
let tableSvc = azure.createTableService()

tableSvc.createTableIfNotExists('answersPerfTest', function (error, result, response) {
    //bulk inserts to test performance
})

