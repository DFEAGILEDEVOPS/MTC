'use strict'

const azure = require('azure-storage')
const bluebird = require('bluebird')
const sqlService = require('../sql.service')
const R = require('ramda')

let tableService

function getAsyncTableService () {
  if (!tableService) {
    tableService = getPromisifiedService(azure.createTableService())
  }
  return tableService
}
/**
 * Promisify and cache the azureTableService library as it still lacks Promise support
 */
function getPromisifiedService (storageService) {
  bluebird.promisifyAll(storageService, {
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
  return storageService
}

const service = {
  getReceivedCheckEntitiesForSchool: async function getReceivedChecksForSchool (schoolUuid) {
    if (!schoolUuid) {
      throw new Error('schoolUuid is required')
    }
    const query = new azure.TableQuery()
      .where('PartitionKey eq ?', schoolUuid)
    const result = await getAsyncTableService().queryEntitiesAsync('receivedCheck', query)
    console.dir(result)
  },

  getReceivedCheck: async function getReceivedCheck (schoolUuid, checkCode) {
    if (!schoolUuid) {
      throw new Error('schoolUuid is required')
    }
    if (!checkCode) {
      throw new Error('checkCode is required')
    }
    const result = await getAsyncTableService().retrieveEntityAsync('receivedCheck', schoolUuid, checkCode)
    console.dir(result)
  },

  getCheckResultEntitiesForSchool: async function getCheckResultForSchool (schoolUuid) {
    if (!schoolUuid) {
      throw new Error('schoolUuid is required')
    }
    const query = new azure.TableQuery()
      .where('PartitionKey eq ?', schoolUuid)
    const result = await getAsyncTableService().queryEntitiesAsync('checkResult', query)
    console.dir(result)
  },

  getCheckResult: async function getReceivedCheck (schoolUuid, checkCode) {
    if (!schoolUuid) {
      throw new Error('schoolUuid is required')
    }
    if (!checkCode) {
      throw new Error('checkCode is required')
    }
    const result = await getAsyncTableService().retrieveEntityAsync('checkResult', schoolUuid, checkCode)
    console.dir(result)
  },

  getSchoolUuidByCheckCode: async function getSchoolUuidByCheckCode (checkCode) {
    const result = await sqlService.query(`
      SELECT s.urlSlug FROM mtc_admin.[check] chk
        INNER JOIN mtc_admin.[pupil] p ON chk.pupil_id = p.id
        INNER JOIN mtc_admin.[school] s ON p.school_id = s.id
      WHERE chk.checkCode = @checkCode`)
    return R.head(result)
  }
}

module.exports = service
