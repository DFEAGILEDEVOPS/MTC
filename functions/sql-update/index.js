'use strict'

const process = require('process')
const sqlService = require('../lib/sql/sql.service')

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

module.exports = async function (context, sqlUpdateMessage) {
  context.log('sql-update: message received', sqlUpdateMessage)

  const { messages } = sqlUpdateMessage

  const queries = []

  messages.forEach(message => {
    const { table, data } = message
    for (let id in data) {
      let query = `UPDATE [mtc_admin].[${table}] SET `
      for (let column in data[id]) {
        query += `${column}='${data[id][column]}' `
      }
      query += `WHERE id=${id}`
      queries.push(query)
    }
  })

  const queriesLn = queries.length

  for (let i = 0; i < queriesLn; i++) {
    const query = queries[i]
    try {
      const res = await sqlService.modify(query)
      if (res.rowsModified === 0) {
        context.log(`sql-update: no rows modified. This may be a bad update: "${query}"`)
      }
    } catch (error) {
      context.log(`sql-update: failed to update the SQL DB with "${query}": ${error.message}`)
      throw error
    }
  }
}
