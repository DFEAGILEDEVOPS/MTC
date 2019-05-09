'use strict'

const process = require('process')
const sqlService = require('../lib/sql/sql.service')
const { TYPES } = sqlService

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

module.exports = async function (context, sqlUpdateMessage) {
  context.log('sql-update: message received', sqlUpdateMessage)

  const { messages } = sqlUpdateMessage

  let queries = []
  let params = []

  messages.forEach((message, i) => {
    const { table, data } = message
    for (let id in data) {
      let thisQuery = `UPDATE [mtc_admin].[${table}] SET `
      for (let column in data[id]) {
        let paramValue = data[id][column]
        params.push({
          name: `${column}${i}`,
          value: paramValue,
          type: /^\d+$/.test(paramValue) ? TYPES.Int : TYPES.NVarChar
        })
        thisQuery += `${column}=@${column}${i} `
      }
      params.push({
        name: `id${i}`,
        value: parseInt(id),
        type: TYPES.Int
      })
      thisQuery += `WHERE id=@id${i}`
      queries.push(thisQuery)
    }
  })

  if (queries.length) {
    try {
      const res = await sqlService.modify(queries.join('; '), params)
      if (res.rowsModified === 0) {
        context.log(`sql-update: no rows modified. This may be a bad update`, queries, params)
      }
    } catch (error) {
      context.log(`sql-update: failed to do updates: ${error.message}`, queries, params)
    }
  }
}
