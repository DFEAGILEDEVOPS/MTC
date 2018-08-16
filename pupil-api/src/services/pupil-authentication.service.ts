'use strict'

import * as azureStorage from 'azure-storage'
import TableService = azureStorage.services.table.TableService
import table = azureStorage.services.table
import * as bluebird from 'bluebird'

export class PupilAuthenticationService {
  azureTableService: any // TableService

  constructor (service: TableService) {
    this.azureTableService = service
  }

  async authenticate (pupilPin: string, schoolPin: string) {
    // TODO: add dynamic tablename based on PREFIX
    const authTable = 'jonPreparedCheck'
    bluebird.promisifyAll(this.azureTableService, {
      promisifier: (originalFunction) => function (...args) {
        return new Promise((resolve, reject) => {
          try {
            originalFunction.call(this, ...args, (error, result, response) => {
              if (error) {
                return reject(error)
              }
              resolve({result, response})
            })
          } catch (error) {
            reject(error)
          }
        })
      }
    })
    console.log('ENV', process.env)
    const res = await this.azureTableService.retrieveEntityAsync(authTable, schoolPin, pupilPin)
    console.log('RES', res)
  }
}
