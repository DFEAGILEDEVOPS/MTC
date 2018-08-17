'use strict'

import * as azureStorage from 'azure-storage'
import * as bluebird from 'bluebird'

let azureTableService: any
const authTable = 'jonPreparedCheck'

export const pupilAuthenticationService = {
  authenticate: async function authenticate (pupilPin: string, schoolPin: string, tableService?: any): Promise<object> {
    // set tableService to azureTableService if not provided, but only instantiate it once.
    if (!tableService) {
      if (!azureTableService) {
        azureTableService = azureStorage.createTableService()
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
      }
      tableService = azureTableService
    }

    const { result } = await tableService.retrieveEntityAsync(authTable, schoolPin, pupilPin)
    const data = this.preparePupilData(result)
    return data
  },


  preparePupilData: function (result): object {
    console.log('RESULT', result)
    const pupilData = {
      questions: JSON.parse(result.questions['_']),
      pupil: JSON.parse(result.pupil['_']),
      school: JSON.parse(result.school['_'])
    }
    return pupilData
  }
}
