'use strict'

// const azureService = require('./azure-storage.service')
const azureStorage = require('azure-storage')
const completedCheckDataService = {}
const uuid = require('uuidv4')
/**
 * Create a new Check
 * @param data
 * @return {Promise}
 */
completedCheckDataService.create = (data) => new Promise((resolve, reject) => {
  var encodedData = Buffer.from(JSON.stringify(data)).toString('base64')
  const entityGenerator = azureStorage.TableUtilities.entityGenerator
  var item = {
    PartitionKey: entityGenerator.String('completedchecks' + new Date().getSeconds()),
    RowKey: entityGenerator.String(uuid().toString()),
    check: entityGenerator.String(encodedData)
  }
  // TODO - can we optimise this by newing up only once in service?
  const tableService = azureStorage.createTableService()
  tableService.insertEntity('completedchecks', item, function (error, result, response) {
    if (error) {
      return reject(error)
    }
    return resolve({ result, response })
  })
})

module.exports = completedCheckDataService
