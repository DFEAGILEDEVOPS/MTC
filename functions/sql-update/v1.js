'use strict'

const sqlService = require('../lib/sql/sql.service')
const { DONT_DROP_REDIS, TYPES } = sqlService

const v1 = {
  process: async function process (context, message) {
    context.log('sql-update: message received', message)

    const { messages } = message

    let queries = []
    let params = []

    messages.forEach((message, i) => {
      const { delete: deleteData, table, update } = message
      if (update) {
        for (let id in update) {
          let thisQuery = `UPDATE [mtc_admin].[${table}] SET `
          for (let column in update[id]) {
            let paramValue = update[id][column]
            const param = `update_${column}_${i}`
            params.push({
              name: param,
              value: paramValue,
              type: /^\d+$/.test(paramValue) ? TYPES.Int : TYPES.NVarChar
            })
            thisQuery += `${column}=@${param} `
          }
          params.push({
            name: `update_ID_${i}`,
            value: id,
            type: TYPES.Int
          })
          thisQuery += `WHERE id=@update_ID_${i}`
          queries.push(thisQuery)
        }
      }
      if (deleteData) {
        const deleteParams = deleteData.map((id, i) => {
          const param = `delete_ID_${i}`
          params.push({
            name: param,
            value: id,
            type: TYPES.Int
          })
          return param
        })
        if (deleteParams.length) {
          queries.push(`DELETE FROM [mtc_admin].[${table}] WHERE id IN (@${deleteParams.join(',@')})`)
        }
      }
    })

    if (queries.length) {
      try {
        const sql = DONT_DROP_REDIS + queries.join('; ')
        const res = await sqlService.modify(sql, params)
        if (res.rowsModified === 0) {
          context.log(`sql-update: no rows modified. This may be a bad update`, queries, params)
        }
      } catch (error) {
        context.log(`sql-update: failed to do updates: ${error.message}`, queries, params)
      }
    }
  }
}

module.exports = v1
