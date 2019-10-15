'use strict'

const R = require('ramda')

const sqlService = require('./sql.service')
const TYPES = sqlService.TYPES
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
 * Updates the service message
 * @param data
 * @return {Promise.<*>}
 */
administrationMessageDataService.sqlUpdate = async (data) => {
  const params = [
    {
      name: 'title',
      value: data.title,
      type: TYPES.NVarChar
    },
    {
      name: 'message',
      value: data.message,
      type: TYPES.NVarChar
    },
    {
      name: 'updatedByUser_id',
      value: data.updatedByUser_id,
      type: TYPES.Int
    }
  ]
  const sql = `
    UPDATE [mtc_admin].serviceMessage
    SET title=@title, message=@message, updatedByUser_id=@updatedByUser_id
    WHERE isDeleted=0`
  await sqlService.modify(sql, params)
}

/**
 * Set the service message as deleted.
 * @returns {Promise.<void>}
 */
administrationMessageDataService.sqlDeleteServiceMessage = async (data) => {
  const params = [
    {
      name: 'deletedByUser_id',
      value: data.deletedByUser_id,
      type: TYPES.Int
    }
  ]
  const sql = `
    UPDATE [mtc_admin].serviceMessage
    SET isDeleted=1, deletedByUser_id=@deletedByUser_id
    WHERE isDeleted=0
  `
  await sqlService.modify(sql, params)
}

/**
 * Fetch active service message
 * @return {Promise<Object>}
 */
administrationMessageDataService.sqlFindActiveServiceMessage = async () => {
  const sql = `
    SELECT TOP 1 *
    FROM [mtc_admin].serviceMessage
    WHERE isDeleted = 0
  `
  const result = await sqlService.query(sql)
  return R.head(result)
}

module.exports = administrationMessageDataService
