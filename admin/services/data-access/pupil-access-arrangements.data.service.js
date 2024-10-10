'use strict'

const { TYPES } = require('./sql.service')
const R = require('ramda')

const sqlService = require('./sql.service')
const pupilAccessArrangementsDataService = {}

/**
 * Find pupil access arrangements by pupil Id
 * @param {Number} pupilId
 * @returns {Promise<Array>}
 */
pupilAccessArrangementsDataService.sqlFindPupilAccessArrangementsByPupilId = async function (pupilId) {
  const sql = `
  SELECT
    paa.*,
    fslu.code AS pupilFontSizeCode,
    cclu.code AS pupilColourContrastCode
  FROM [mtc_admin].[pupilAccessArrangements] paa
  LEFT OUTER JOIN [mtc_admin].[fontSizeLookup] fslu
    ON paa.fontSizeLookup_Id = fslu.id
  LEFT OUTER JOIN [mtc_admin].[colourContrastLookup] cclu
    ON paa.colourContrastLookup_Id = cclu.id
  WHERE pupil_id = @pupilId`
  const params = [
    { name: 'pupilId', type: TYPES.Int, value: pupilId }
  ]
  return sqlService.readonlyQuery(sql, params)
}

/**
 * Create a new pupil access arrangement.
 * @param {object} data
 * @param {Boolean} isUpdate
 * @return {Promise<Object>}
 */
pupilAccessArrangementsDataService.sqlInsertAccessArrangements = async (data, isUpdate = false) => {
  const {
    pupil_id: pupilId,
    recordedBy_user_id: recordedByUserId,
    accessArrangementsIdsWithCodes
  } = data

  const params = []
  const queries = []
  const inserts = []

  if (isUpdate) {
    params.push({
      name: 'pupil_id',
      value: pupilId,
      type: TYPES.Int
    })
    queries.push('DELETE [mtc_admin].[pupilAccessArrangements] WHERE pupil_id = @pupil_id')
  }

  accessArrangementsIdsWithCodes.forEach((aa, idx) => {
    inserts.push(`(
      @pupil_id${idx},
      @recordedBy_user_id${idx},
      @accessArrangements_id${idx},
      @fontSizeLookup_id${idx},
      @colourContrastLookup_id${idx}
    )`)
    params.push({
      name: `pupil_id${idx}`,
      value: pupilId,
      type: TYPES.Int
    })
    params.push({
      name: `recordedBy_user_id${idx}`,
      value: recordedByUserId,
      type: TYPES.Int
    })
    params.push({
      name: `accessArrangements_id${idx}`,
      value: aa.id,
      type: TYPES.Int
    })
    params.push({
      name: `fontSizeLookup_id${idx}`,
      value: aa.fontSizeLookup_Id || null,
      type: TYPES.Int
    })
    params.push({
      name: `colourContrastLookup_id${idx}`,
      value: aa.colourContrastLookup_Id || null,
      type: TYPES.Int
    })
  })

  const insertSql = `INSERT INTO [mtc_admin].[pupilAccessArrangements] (
      pupil_id,
      recordedBy_user_id,
      accessArrangements_id,
      fontSizeLookup_Id,
      colourContrastLookup_Id
      ) VALUES`

  queries.push([insertSql, inserts.join(', \n')].join(' '))
  const sql = queries.join('\n')
  return sqlService.modify(sql, params)
}

/**
 * Find pupil ids with access arrangements based on DfE Number.
 * @param {Number} schoolId
 * @return {Promise<Array>}
 */
pupilAccessArrangementsDataService.sqFindPupilsWithAccessArrangements = async (schoolId) => {
  const params = [
    {
      name: 'schoolId',
      value: schoolId,
      type: TYPES.Int
    }
  ]
  const sql = `
  SELECT
    p.urlSlug,
    p.foreName,
    p.middleNames,
    p.lastName,
    p.dateOfBirth,
    aa.description,
    p.checkcomplete AS hasCompletedCheck,
    ISNULL(cia.isRetrospective, 0) AS [retroInputAssistant]
  FROM [mtc_admin].pupilaccessarrangements paa
    INNER JOIN [mtc_admin].pupil p ON paa.pupil_id = p.id
    INNER JOIN [mtc_admin].accessarrangements aa ON aa.id = paa.accessarrangements_id
    LEFT OUTER JOIN [mtc_admin].checkInputAssistant cia ON cia.pupil_id = p.id
  WHERE p.school_id = @schoolId
  ORDER BY [retroInputAssistant] DESC`
  // order by is a dirty hack in order to ensure that the retro input assistant flag is preserved during the reduction
  // that takes place in pupilAccessArrangementsService.getPupils.  This should be refactored.
  return sqlService.readonlyQuery(sql, params)
}

/**
 * Find pupils eligible for access arrangements based on DfE Number.
 * @param {Number} schoolId
 * @return {Promise<Array>}
 */
pupilAccessArrangementsDataService.sqlFindEligiblePupilsBySchoolId = async (schoolId) => {
  const params = [
    {
      name: 'schoolId',
      value: schoolId,
      type: TYPES.Int
    }
  ]
  const sql = `
      SELECT
          p.id,
          p.foreName,
          p.lastName,
          p.middleNames,
          p.dateOfBirth,
          p.group_id,
          p.urlSlug
        FROM
            [mtc_admin].[pupil] p
            LEFT JOIN [mtc_admin].[pupilAccessArrangements] paa ON (paa.pupil_id = p.id)
       WHERE p.school_id = @schoolId
         AND p.attendanceId IS NULL
         AND p.checkComplete = 0
         AND paa.pupil_id IS NULL
         AND p.frozen = 0
       ORDER BY lastName;
  `
  return sqlService.readonlyQuery(sql, params)
}

pupilAccessArrangementsDataService.sqlFindAccessArrangementsByUrlSlug = async (urlSlug) => {
  const params = [
    {
      name: 'urlSlug',
      value: urlSlug,
      type: TYPES.NVarChar
    }
  ]
  const sql =
    `SELECT
      p.urlSlug,
      p.foreName,
      p.lastName,
      aa.code as accessArrangementCode
    FROM [mtc_admin].pupilAccessArrangements paa
    INNER JOIN [mtc_admin].pupil p ON (p.id = paa.pupil_id)
    INNER JOIN [mtc_admin].accessArrangements aa ON (aa.id = paa.accessArrangements_id)
    WHERE p.urlSlug = @urlSlug`
  return sqlService.readonlyQuery(sql, params)
}

/**
 * Delete pupil's access arrangements.
 * @param {String} urlSlug
 * @return {Promise<Object>}
 */
pupilAccessArrangementsDataService.sqlDeletePupilsAccessArrangements = async (urlSlug) => {
  const sql = `DELETE paa FROM [mtc_admin].[pupilAccessArrangements] paa
    INNER JOIN [mtc_admin].pupil p
    ON p.id = paa.pupil_id
    WHERE p.urlSlug = @urlSlug
    AND p.frozen = 0`
  const params = [
    {
      name: 'urlSlug',
      value: urlSlug,
      type: TYPES.NVarChar
    }
  ]
  return sqlService.query(sql, params)
}

pupilAccessArrangementsDataService.sqlFindPupilColourContrastsId = async (pupilId, accessArrangementsId) => {
  const sql = `SELECT colourContrastLookup_Id FROM [mtc_admin].[pupilAccessArrangements]
    WHERE pupil_id = @pupilId
    AND accessArrangements_id = @accessArrangementsId`

  const params = [
    {
      name: 'pupilId',
      value: pupilId,
      type: TYPES.Int
    },
    {
      name: 'accessArrangementsId',
      value: accessArrangementsId,
      type: TYPES.Int
    }
  ]
  const result = await sqlService.readonlyQuery(sql, params)
  const row = R.head(result)
  // @ts-ignore
  return row && row.colourContrastLookup_Id
}

pupilAccessArrangementsDataService.sqlFindPupilFontSizesId = async (pupilId, accessArrangementsId) => {
  const sql = `SELECT fontSizeLookup_Id FROM [mtc_admin].[pupilAccessArrangements]
    WHERE pupil_id = @pupilId
    AND accessArrangements_id = @accessArrangementsId`

  const params = [
    {
      name: 'pupilId',
      value: pupilId,
      type: TYPES.Int
    },
    {
      name: 'accessArrangementsId',
      value: accessArrangementsId,
      type: TYPES.Int
    }
  ]
  const result = await sqlService.readonlyQuery(sql, params)
  const row = R.head(result)
  // @ts-ignore
  return row && row.fontSizeLookup_Id
}

module.exports = pupilAccessArrangementsDataService
