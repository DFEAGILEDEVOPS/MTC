'use strict'

const azure = require('azure-storage')
const bluebird = require('bluebird')
let azureTableService

/**
 * Promisify and cache the azureTableService library as it still lacks Promise support
 */
const service = {
  getPromisifiedAzureTableService: function getPromisifiedAzureTableService () {
    if (azureTableService) {
      return azureTableService
    }
    azureTableService = azure.createTableService()
    bluebird.promisifyAll(azureTableService, {
      promisifier: (originalFunction) => function (...args) {
        return new Promise((resolve, reject) => {
          try {
            originalFunction.call(this, ...args, (error, result, response) => {
              if (error) {
                return reject(error)
              }
              resolve({ result, response })
            })
          } catch (error) {
            reject(error)
          }
        })
      }
    })

    return azureTableService
  }
}

module.exports = service
