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
  },

  sqlFindAllFormsAssignedToCheckWindow: (windowId, isLiveCheck) => {
    const sql = `
      SELECT
        cf.id
      FROM [mtc_admin].[checkForm] cf
      LEFT JOIN [mtc_admin].[checkFormWindow] cfw ON (cf.id = cfw.checkForm_id)
      LEFT JOIN [mtc_admin].[checkWindow] cw ON (cfw.checkWindow_id = cw.id)
      WHERE cf.isDeleted = 0
      AND cw.id = @windowId
      AND isLiveCheckForm = @isLiveCheckForm`

    const params = [
      {
        name: 'windowId',
        value: windowId,
        type: TYPES.Int
      },
      {
        name: 'isLiveCheckForm',
        value: isLiveCheck ? 1 : 0,
        type: TYPES.Bit
      }
    ]

    return sqlService.query(sql, params)
  },

  sqlFindAllFormsUsedByPupils: async function (pupilIds) {
    const select = `SELECT
    f.id,
    f.name,
    c.pupil_id
  FROM 
    [mtc_admin].[check] c INNER JOIN
    [mtc_admin].[checkForm] f ON c.checkForm_id = f.id
  WHERE
    f.isDeleted <> 1
  `
    const where = sqlService.buildParameterList(pupilIds, TYPES.Int)
    const andClause = 'AND pupil_id IN (' + where.paramIdentifiers.join(', ') + ')'
    const sql = [select, andClause].join(' ')
    const results = await sqlService.query(sql, where.params)
    const byPupil = {}
    results.forEach(x => {
      if (byPupil[x.pupil_id]) {
        byPupil[x.pupil_id].push(x)
      } else {
        byPupil[x.pupil_id] = [x]
      }
    })
    return byPupil
  }
}

module.exports = checkStartDataService
