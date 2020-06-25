'use strict'

const R = require('ramda')

const sqlService = require('../../data-access/sql.service')
const TYPES = sqlService.TYPES

const ctfDataService = {
  /**
   * Find the HDF for a given check
   * @param schoolId
   * @param checkWindowId
   * @return {Promise<boolean>}
   */
  isHdfSigned: async function isHdfSigned (schoolId, checkWindowId) {
    const paramSchoolId = { name: 'schoolId', type: TYPES.Int, value: schoolId }
    const paramCheckWindow = { name: 'checkWindowId', type: TYPES.BigInt, value: checkWindowId }
    const sql = `
        SELECT TOP 1 id, signedDate, school_id, checkWindow_id
          FROM [mtc_admin].[hdf]
         WHERE checkWindow_id = @checkWindowId
           AND school_id = @schoolId`
    const result = await sqlService.query(sql, [paramCheckWindow, paramSchoolId])
    /* @var first {{id: number, signedDate: null|moment.Moment, checkWindow_id: number, school_id: number} | undefined} */
    const first = R.head(result)
    if (!first) {
      return false // no hdf
    }
    if (!first.signedDate) {
      return false // no signed hdf
    }
    return true // signed hdf
  }
}

module.exports = ctfDataService
