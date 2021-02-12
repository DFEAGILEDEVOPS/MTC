'use strict'
const sqlService = require('./sql.service')

const laCodeDataService = {
  /**
   * Return an array of laCods
   * @return {Promise<number[]>}
   */
  sqlGetLaCodes: async function getLaCodes () {
    const sql = 'select laCode from mtc_admin.laCodeLookup where laCode <> 0'
    const data = await sqlService.query(sql)
    const laCodes = data.map(o => o.laCode)
    return laCodes
  }
}

module.exports = laCodeDataService
