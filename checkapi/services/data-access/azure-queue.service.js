// azure table storage
const azureStorage = require('azure-storage')

let queueService = null

module.exports.init = () => new Promise((resolve, reject) => {
  if (queueService) {
    reject(new Error('queueService already initialised'))
  }
  queueService = azureStorage.createQueueService()
  queueService.createQueueIfNotExists('completedchecks', function (error, result, response) {
    if (error) {
      reject(error)
    }
    resolve(response)
  })
})
