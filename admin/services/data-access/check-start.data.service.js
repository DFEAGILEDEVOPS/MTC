'use strict'
const sqlService = require('./sql.service')
const R = require('ramda')

const checkStartDataService = {
  sqlStoreBatchConfigs: async function (config) {
    const sqls = config.map((conf, idx) => {
      const insert = `INSERT INTO [mtc_admin].[checkConfig] (check_id, payload) VALUES (@checkId${idx}, @payload${idx});`
      const params = [
        { name: `checkId${idx}`, value: conf.checkId, type: sqlService.TYPES.Int },
        { name: `payload${idx}`, value: JSON.stringify(conf.config), type: sqlService.TYPES.NVarChar }
      ]
      return { sql: insert, params }
    })
    const params = R.flatten(
      R.map(R.prop('params'), sqls)
    )
    const inserts = R.join('\n', R.map(R.prop('sql'), sqls))
    return sqlService.modifyWithTransaction(inserts, params)
  }
}

module.exports = checkStartDataService
