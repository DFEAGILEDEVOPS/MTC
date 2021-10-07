'use strict'

const tableService = require('./azure-table.data.service')
const sqlService = require('./sql.service')

const payloadDataService = {
  /**
   * Retrieve a check payload.  Case insensitive.
   * @param checkCode
   * @return {Promise<any>}
   */
  sqlFindOneByCheckCode: async function sqlFindOneByCheckCode (checkCode) {
    // We need to retrieve the school GUID so we can get the checkCode, which is RowKey
    const sql = `SELECT s.urlSlug
                   FROM mtc_admin.school s
                        JOIN mtc_admin.pupil p ON (p.school_id = s.id)
                        JOIN mtc_admin.[check] chk ON (p.id = chk.pupil_id)
                  WHERE chk.checkCode = @checkCode`
    const params = [{
      name: 'checkCode',
      type: sqlService.TYPES.UniqueIdentifier,
      value: checkCode
    }]
    const res = await sqlService.readonlyQuery(sql, params)
    if (res.length === 0) {
      return
    }
    const schoolUrlSlug = res[0].urlSlug
    const table = 'receivedCheck'
    return tableService.retrieveEntity(table, schoolUrlSlug.toLowerCase(), checkCode.toLowerCase())
  }
}

module.exports = payloadDataService
