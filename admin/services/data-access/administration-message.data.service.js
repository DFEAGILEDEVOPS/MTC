'use strict'

const R = require('ramda')
const { TYPES } = require('./sql.service')

const sqlService = require('./sql.service')
const administrationMessageDataService = {}

/**
 * Create a new service message
 * @param data
 * @return
 */
administrationMessageDataService.sqlCreateOrUpdate = async (data) => {
  if (data.id !== undefined) {
    const sql = 'UPDATE [mtc_admin].[serviceMessage] SET title = @title, message = @message WHERE id = @id'
    const params = [
      { name: 'id', value: data.id, type: TYPES.Int },
      { name: 'title', value: data.title, type: TYPES.NVarChar(TYPES.MAX) },
      { name: 'message', value: data.message, type: TYPES.NVarChar(TYPES.MAX) }
    ]
    await sqlService.modify(sql, params)
  } else {
    await sqlService.create('serviceMessage', data)
  }
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
 * @return {Promise<{ title: string, message: string, id: number }>}
 */
administrationMessageDataService.sqlFindActiveServiceMessage = async () => {
  const sql = `
    SELECT TOP 1
    *
    FROM [mtc_admin].serviceMessage
  `
  const result = await sqlService.readonlyQuery(sql)
  // @ts-ignore
  return R.head(result)
}

module.exports = administrationMessageDataService
