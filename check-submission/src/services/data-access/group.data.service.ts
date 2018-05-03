'use strict'

const sqlService = require('./sql.service')
const TYPES = require('tedious').TYPES
const R = require('ramda')

const groupDataService = {
  /**
   * Find group by pupil id
   * @param pupilId
   * @return {Object}
   */
  sqlFindOneGroupByPupilId: async (pupilId) => {
    if (!pupilId) return false

    const sql = `SELECT * FROM mtc_admin.[group] g
  INNER JOIN mtc_admin.pupilGroup pg ON g.id = pg.group_id
  WHERE pg.pupil_id = @pupilId AND g.isDeleted = 0`

    const params = [
      {
        name: 'pupilId',
        value: pupilId,
        type: TYPES.Int
      }
    ]

    const result = await sqlService.query(sql, params)
    return R.head(result)
  }
}

export = groupDataService
