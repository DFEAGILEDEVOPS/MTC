'use strict'

const R = require('ramda')

const sqlService = require('./sql.service')
const administrationMessageDataService = {}

/**
 * Create a new service message
 * @param data
 * @return {Promise.<*>}
 */
administrationMessageDataService.sqlCreate = async (data) => {
  await sqlService.create('serviceMessage', data)
}

/**
 * Delete the service message (single) row.
 * @returns {Promise.<void>}
 */
administrationMessageDataService.sqlDeleteServiceMessage = async () => {
  const sql = `
    DELETE FROM [mtc_admin].serviceMessage;
  `
  await sqlService.modify(sql)
}

/**
 * Fetch active service message
 * @return {Promise<Object>}
 */
administrationMessageDataService.sqlFindActiveServiceMessage = async () => {
  const sql = `
    SELECT *
    FROM [mtc_admin].serviceMessage
  `
  const result = await sqlService.query(sql)
  return R.head(result)
}

module.exports = administrationMessageDataService
