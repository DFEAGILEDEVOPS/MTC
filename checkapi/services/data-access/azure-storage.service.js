// azure table storage
const azureStorage = require('azure-storage')

let tableService = null

module.exports.init = () => new Promise((resolve, reject) => {
  if (tableService) {
    reject(new Error('tableService already initialised'))
  }
  tableService = azureStorage.createTableService()
  tableService.createTableIfNotExists('completedchecks', function (error, result, response) {
    if (error) {
      reject(error)
    }
    resolve(response)
  })
})
