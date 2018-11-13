import * as azureStorage from 'azure-storage'
import * as bluebird from 'bluebird'
import { clone, path } from 'ramda'
import * as winston from 'winston'
import * as moment from 'moment'

let azureTableService: any
const authTable = 'preparedCheck'

function initAzureTableService (): void {
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
}

export const pupilAuthenticationService = {
  authenticate: async function authenticate (pupilPin: string, schoolPin: string, tableService?: any): Promise<object> {
    // set tableService to azureTableService if not provided, but only instantiate it once.
    if (!tableService) {
      initAzureTableService()
      tableService = azureTableService
    }

    // This will throw if the pupil is not found
    const { result } = await tableService.retrieveEntityAsync(authTable, schoolPin, pupilPin)

    if (!path(['pinExpiresAt', '_'], result)) {
      throw new Error(`PIN expiry is missing ${result.checkCode._}`)
    }

    const pinExpires = moment(result.pinExpiresAt._)
    const now = moment()

    if (pinExpires.isBefore(now)) {
      throw new Error(`PIN has expired ${result.checkCode._}`)
    }

    // Prepare the pupil data for use by the SPA
    const data = this.preparePupilData(result)

    // Mark the data in the preparedCheck table as having been collected
    try {
      await this.markAsCollected(tableService, clone(result))
    } catch (error) {
      winston.error(error.message)
      throw error
    }

    return data
  },

  /**
   * Prepare the data to be sent back to the pupil
   *
   * When the data back out of Azure Table Storage it is not clean - all strings are turned into objects with a key of '-'
   * See: https://docs.microsoft.com/en-us/azure/cosmos-db/table-storage-how-to-use-nodejs
   *
   * This function cleans that up and prepares the data to be sent to the client.
   * @param result - the entity retrieved from Table Storage
   */
  preparePupilData: function (result): object {
    const pupilData = {
      questions: JSON.parse(result.questions['_']),
      pupil: JSON.parse(result.pupil['_']),
      school: JSON.parse(result.school['_']),
      config: JSON.parse(result.config['_']),
      tokens: JSON.parse(result.tokens['_'])
    }
    return pupilData
  },

  markAsCollected: async function (tableService, update): Promise<void> {
    const entGen = azureStorage.TableUtilities.entityGenerator
    const now = entGen.DateTime(new Date()) // this works, column gets DateTime type
    update.isCollected = true
    update.collectedAt = now
    update.updatedAt = now
    try {
      const updateResult = await tableService.replaceEntityAsync(authTable, update)
      if (updateResult.response.isSuccessful !== true) {
        throw new Error('Update was not successful')
      }
    } catch (error) {
      winston.error('Failed to update: ' + error.message)
      throw error
    }
  }
}
