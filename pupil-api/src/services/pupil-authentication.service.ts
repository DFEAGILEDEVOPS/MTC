'use strict'

import * as azureStorage from 'azure-storage'
import * as bluebird from 'bluebird'

let azureTableService: any
const authTable = 'jonPreparedCheck'

export const pupilAuthenticationService = {
  authenticate: async function authenticate (pupilPin: string, schoolPin: string, tableService?: any) {
    // set tableService to azureTableService if not provided, but only instantiate it once.
    if (!tableService) {
      if (!azureTableService) {
        azureTableService = azureStorage.createTableService()
      }
      tableService = azureTableService
    }

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

    const { result } = await tableService.retrieveEntityAsync(authTable, schoolPin, pupilPin)
    return result
  }
}
