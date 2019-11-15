'use strict'
const sqlService = require('../../data-access/sql.service')
const { TYPES } = sqlService
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
  },

  /**
   * Batch update the pupil `currentCheckId with the provided checkId`
   * @param { {pupilId: number, checkId: number}[] } data
   * @return {Promise<*|undefined>}
   */
  updatePupilState: async function updatePupilState (schoolId, data) {
    const sqls = data.map((item, idx) => {
      const insert = `UPDATE [mtc_admin].[pupil] 
                      SET currentCheckId = @checkId${idx},
                          checkComplete = 0
                      WHERE id=@pupilId${idx}
                      AND school_id=@schoolId${idx};`
      const params = [
        { name: `checkId${idx}`, value: item.checkId, type: sqlService.TYPES.Int },
        { name: `pupilId${idx}`, value: item.pupilId, type: sqlService.TYPES.Int },
        { name: `schoolId${idx}`, value: schoolId, type: sqlService.TYPES.Int }
      ]
      return { sql: insert, params }
    })
    const params = R.flatten(
      R.map(R.prop('params'), sqls)
    )
    const inserts = R.join('\n', R.map(R.prop('sql'), sqls))
    return sqlService.modifyWithTransaction(inserts, params)
  },

  /** Retrieve a list of pupils eligible for pin generation
   *
   * @param {number} schoolId
   * @param {number[]} pupilIds
   * @param {boolean} isLiveCheck
   * @return {Promise<*>}
   */
  sqlFindPupilsEligibleForPinGenerationById: async (schoolId, pupilIds, isLiveCheck) => {
    const view = isLiveCheck ? 'vewPupilsEligibleForLivePinGeneration' : 'vewPupilsEligibleForTryItOutPin'
    const select = `SELECT *
                    FROM [mtc_admin].[${view}]`
    const { params, paramIdentifiers } = sqlService.buildParameterList(pupilIds, TYPES.Int)
    const whereClause = `WHERE id IN (${paramIdentifiers.join(', ')}) AND school_id = @schoolId`
    params.push({
      name: 'schoolId',
      value: schoolId,
      type: TYPES.Int
    })
    const sql = [select, whereClause].join(' ')
    return sqlService.query(sql, params)
  }
}

module.exports = checkStartDataService
