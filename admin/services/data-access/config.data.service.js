'use strict'

const sqlService = require('./sql.service')
const TYPES = sqlService.TYPES

const configDataService = {
  getBatchConfig: async function getBatchConfig (pupilIds, schoolId) {
    if (!Array.isArray(pupilIds)) {
      throw new Error('pupilIds must be an Array')
    }
    if (!schoolId) {
      throw new Error('schoolId is a required parameter')
    }
    const pupilParamNames = pupilIds.map((pupil, idx) => `@pupil${idx}`)
    const pupilParams = pupilIds.map((pupil, idx) => { return { name: `pupil${idx}`, value: pupil, type: TYPES.Int } })
    const sql = `
      SELECT
          p.id as pupilId,
          s.id as schoolId,

          -- global question time settings
          st.loadingTimeLimit as loadingTime,
          st.questionTimeLimit as questionTime,
          st.checkTimeLimit as checkTime,

          -- pupil configs
          STRING_AGG (aa.code, ',') as accessArrangementCodes,
          STRING_AGG (pfs.code, ',') as fontSizeCode,
          STRING_AGG (pcc.code, ',') as colourContrastCode

        FROM
          mtc_admin.[pupil] p JOIN
          mtc_admin.[school] s ON (p.school_id = s.id) CROSS JOIN
          mtc_admin.[settings] st LEFT JOIN
          mtc_admin.[pupilAccessArrangements] paa ON (p.id = paa.pupil_id) LEFT JOIN
          mtc_admin.[pupilFontSizes] pfs on (paa.pupilFontSizes_id = pfs.id) LEFT JOIN
          mtc_admin.[pupilColourContrasts] pcc ON (paa.pupilColourContrasts_id = pcc.id) LEFT JOIN
          mtc_admin.[accessArrangements] aa ON (paa.accessArrangements_id = aa.id)
        WHERE
          p.id IN ( ${pupilParamNames.join(', ')} )
        AND s.id = @schoolId
        GROUP BY p.id, s.id, st.loadingTimeLimit, st.questionTimeLimit, st.checkTimeLimit`

    const params = [
      { name: 'schoolId', value: schoolId, type: TYPES.Int }
    ].concat(pupilParams)

    return sqlService.query(sql, params)
  }
}

module.exports = configDataService
