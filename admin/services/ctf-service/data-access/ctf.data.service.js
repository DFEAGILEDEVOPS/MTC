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
  },

  /**
   * Find basic school data
   * @param {number} schoolId
   * @return {Promise<?{id:number, name:string, leaCode:number, estabCode:string, dfeNumber:number, urn:number}>}
   */
  getSchoolData: async function getSchoolData (schoolId) {
    // This method uses a work-around to avoid the bad code in sqlService.transformData which causes some strings
    // to be interpreted as Dates. Once that has been corrected, estabCode will no longer need to converted to int and
    // back to string.
    const sql = `SELECT id, name, leaCode, CAST(estabCode as Int) as estabCode, dfeNumber, urn
                   FROM [mtc_admin].[school]
                  WHERE id = @schoolId`
    const params = { name: 'schoolId', value: schoolId, type: TYPES.Int }
    const data = await sqlService.readonlyQuery(sql, [params])
    const school = R.head(data)
    // @ts-ignore
    return R.assoc('estabCode', school.estabCode.toString().padStart(4, '0'), school)
  },

  /**
   * Get the current academic year, e.g. 2019
   * Use the checkStartDate property of the checkWindow to get the check year, and assume the Academic year is one less than that.
   * @return {Promise<?Number>}
   */
  getAcademicYear: async function getAcademicYear () {
    const sql = `SELECT TOP 1 *
                   FROM [mtc_admin].[checkWindow]
                  WHERE isDeleted = 0
                    AND GETUTCDATE() > adminStartDate
                    AND GETUTCDATE() < adminEndDate`
    const result = await sqlService.readonlyQuery(sql)
    /** @type * checkWindow */
    const checkWindow = R.head(result)
    const checkStartYear = Number(checkWindow.checkStartDate.format('YYYY'))

    // If the check is taken in June then the academic year will always be the year before
    return checkStartYear - 1
  }
}

module.exports = ctfDataService
