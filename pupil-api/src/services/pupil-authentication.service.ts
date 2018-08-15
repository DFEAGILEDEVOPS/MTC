'use strict'

import * as azureStorage from 'azure-storage'
import TableService = azureStorage.services.table.TableService

export class PupilAuthenticationService {
  azureTableService: TableService

  constructor (service: TableService) {
    this.azureTableService = service
  }

  async authenticate (pupilPin: string, schoolPin: string) {
    // TODO: add dynamic tablename based on PREFIX
    const authTable = 'preparedCheck'
    this.azureTableService.retrieveEntity(authTable, schoolPin, pupilPin, function (error, result, response) {
      if (error) {
        console.log('Error retrieving from Table Storage: ', error)
        return
      }
      console.log('RESPONSE', response)
      console.log('REQUEST', result)
    })
  }
}
