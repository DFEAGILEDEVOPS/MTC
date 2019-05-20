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
  paa.*, pfs.code AS pupilFontSizeCode, pcc.code AS pupilColourContrastCode
  FROM ${sqlService.adminSchema}.[pupilAccessArrangements] paa
  LEFT OUTER JOIN ${sqlService.adminSchema}.[pupilFontSizes] pfs
  ON paa.pupilFontSizes_id = pfs.id
  LEFT OUTER JOIN ${sqlService.adminSchema}.[pupilColourContrasts] pcc
  ON paa.pupilColourContrasts_id = pcc.id
  WHERE pupil_id = @pupilId`
  const params = [
    { name: 'pupilId', type: TYPES.Int, value: pupilId }
  ]
  return sqlService.query(sql, params)
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
    accessArrangementsIdsWithCodes,
    questionReaderReasonCode,
    inputAssistanceInformation,
    nextButtonInformation,
    questionReaderOtherInformation
  } = data

  const params = []
  const queries = []
  const inserts = []

  if (isUpdate) {
    params.push({
      name: `pupil_id`,
      value: pupilId,
      type: TYPES.Int
    })
    queries.push(`DELETE ${sqlService.adminSchema}.[pupilAccessArrangements] WHERE pupil_id = @pupil_id`)
  }

  accessArrangementsIdsWithCodes.forEach((aa, idx) => {
    inserts.push(`(
      @pupil_id${idx},
      @recordedBy_user_id${idx},
      @accessArrangements_id${idx},
      @questionReaderReasons_id${idx},
      @inputAssistanceInformation${idx},
      @nextButtonInformation${idx},
      @questionReaderOtherInformation${idx},
      @pupilFontSizes_id${idx},
      @pupilColourContrasts_id${idx}
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
      name: `questionReaderReasons_id${idx}`,
      value: aa.code === 'QNR' ? data['questionReaderReasons_id'] : null,
      type: TYPES.Int
    })
    params.push({
      name: `inputAssistanceInformation${idx}`,
      value: aa.code === 'ITA' ? inputAssistanceInformation : '',
      type: TYPES.NVarChar
    })
    params.push({
      name: `nextButtonInformation${idx}`,
      value: aa.code === 'NBQ' ? nextButtonInformation : '',
      type: TYPES.NVarChar
    })
    params.push({
      name: `questionReaderOtherInformation${idx}`,
      value: aa.code === 'QNR' && questionReaderReasonCode === 'OTH' ? questionReaderOtherInformation : '',
      type: TYPES.NVarChar
    })
    params.push({
      name: `pupilFontSizes_id${idx}`,
      value: aa['pupilFontSizes_id'] || null,
      type: TYPES.Int
    })
    params.push({
      name: `pupilColourContrasts_id${idx}`,
      value: aa['pupilColourContrasts_id'] || null,
      type: TYPES.Int
    })
  })

  const insertSql = `INSERT INTO ${sqlService.adminSchema}.[pupilAccessArrangements] (
      pupil_id, 
      recordedBy_user_id, 
      accessArrangements_id,
      questionReaderReasons_id,
      inputAssistanceInformation,
      nextButtonInformation,
      questionReaderOtherInformation,
      pupilFontSizes_id,
      pupilColourContrasts_id
      ) VALUES`

  queries.push([insertSql, inserts.join(', \n')].join(' '))
  const sql = queries.join('\n')
  return sqlService.modify(sql, params)
}

/**
 * Find pupil ids with access arrangements based on DfE Number.
 * @param {Number} dfeNumber
 * @return {Promise<Array>}
 */
pupilAccessArrangementsDataService.sqFindPupilsWithAccessArrangements = async (dfeNumber) => {
  const params = [
    {
      name: 'dfeNumber',
      value: dfeNumber,
      type: TYPES.Int
    }
  ]
  const sql = `
    SELECT *, completedCheck & ~unusedRestart hasCompletedCheck
    FROM (
      SELECT p.urlSlug, p.foreName, p.middleNames, p.lastName, p.dateOfBirth, aa.description,
      CASE WHEN unusedRestart.id IS NULL THEN 0 ELSE 1 END unusedRestart,
      CASE WHEN pa.id IS NULL THEN 0 ELSE 1 END notTakingCheck,
      CASE WHEN ps.code = 'COMPLETED' THEN 1 ELSE 0 END completedCheck
      FROM ${sqlService.adminSchema}.pupilAccessArrangements paa
        INNER JOIN ${sqlService.adminSchema}.pupil p
          ON paa.pupil_id = p.id
        INNER JOIN ${sqlService.adminSchema}.pupilStatusLink psl
          ON psl.pupil_id = p.id
        INNER JOIN ${sqlService.adminSchema}.pupilStatus ps
         ON ps.id = ISNULL(psl.pupilStatus_id, 1)
        INNER JOIN ${sqlService.adminSchema}.school s
          ON p.school_id = s.id
        INNER JOIN ${sqlService.adminSchema}.accessArrangements aa
          ON aa.id = paa.accessArrangements_id
        LEFT JOIN ${sqlService.adminSchema}.pupilAttendance pa
          ON pa.pupil_id = p.id AND pa.isDeleted = 0
        LEFT JOIN (
          SELECT pr.id, pr.pupil_id, ROW_NUMBER() OVER (PARTITION BY pr.pupil_id ORDER BY pr.id DESC) as rank
             FROM ${sqlService.adminSchema}.[pupilRestart] pr
             WHERE isDeleted = 0
             AND check_id is NULL
           ) unusedRestart ON (p.id = unusedRestart.pupil_id) AND unusedRestart.rank = 1
      WHERE s.dfeNumber = @dfeNumber
    ) p
    ORDER BY p.lastName
  `
  return sqlService.query(sql, params)
}

/**
 * Find pupils eligible for access arrangements based on DfE Number.
 * @param {Number} dfeNumber
 * @return {Promise<Array>}
 */
pupilAccessArrangementsDataService.sqlFindEligiblePupilsByDfeNumber = async (dfeNumber) => {
  const params = [
    {
      name: 'dfeNumber',
      value: dfeNumber,
      type: TYPES.Int
    }
  ]
  const sql = `
    SELECT *
    FROM (
      SELECT p.*,
      CASE WHEN unusedRestart.id IS NULL THEN 0 ELSE 1 END unusedRestart,
      CASE WHEN pa.id IS NULL THEN 0 ELSE 1 END notTakingCheck,
      CASE WHEN ps.code = 'COMPLETED' THEN 1 ELSE 0 END completedCheck
      FROM ${sqlService.adminSchema}.pupil p
      INNER JOIN ${sqlService.adminSchema}.school s
        ON p.school_id = s.id
      INNER JOIN ${sqlService.adminSchema}.pupilStatusLink psl
        ON psl.pupil_id = p.id
      INNER JOIN ${sqlService.adminSchema}.pupilStatus ps
       ON ps.id = ISNULL(psl.pupilStatus_id, 1)
      LEFT JOIN ${sqlService.adminSchema}.pupilAttendance pa
        ON pa.pupil_id = p.id AND pa.isDeleted = 0
      LEFT JOIN (
        SELECT pr.id, pr.pupil_id, ROW_NUMBER() OVER (PARTITION BY pr.pupil_id ORDER BY pr.id DESC) as rank
           FROM ${sqlService.adminSchema}.[pupilRestart] pr
           WHERE isDeleted = 0
           AND check_id is NULL
         ) unusedRestart ON (p.id = unusedRestart.pupil_id) AND unusedRestart.rank = 1
      WHERE s.dfeNumber = @dfeNumber
    ) p
    LEFT JOIN [mtc_admin].[pupilAccessArrangements] paa
      ON paa.pupil_id = p.id
    WHERE notTakingCheck = 0
    AND (completedCheck = 0 OR unusedRestart = 1)
    AND paa.pupil_id IS NULL
    ORDER BY lastName
  `
  return sqlService.query(sql, params)
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
    paa.inputAssistanceInformation,
    paa.nextButtonInformation,
    paa.questionReaderOtherInformation,
    aa.code as accessArrangementCode,
    qrr.code as questionReaderReasonCode 
    FROM ${sqlService.adminSchema}.pupilAccessArrangements paa
    INNER JOIN ${sqlService.adminSchema}.pupil p
      ON p.id = paa.pupil_id
    INNER JOIN ${sqlService.adminSchema}.accessArrangements aa
      ON aa.id = paa.accessArrangements_id
    LEFT JOIN ${sqlService.adminSchema}.questionReaderReasons qrr
      ON qrr.id = paa.questionReaderReasons_id
    WHERE p.urlSlug = @urlSlug`
  return sqlService.query(sql, params)
}

/**
 * Delete pupil's access arrangements.
 * @param {String} urlSlug
 * @return {Object}
 */
pupilAccessArrangementsDataService.sqlDeletePupilsAccessArrangements = async (urlSlug) => {
  const sql = `DELETE paa FROM ${sqlService.adminSchema}.[pupilAccessArrangements] paa
    INNER JOIN ${sqlService.adminSchema}.pupil p
    ON p.id = paa.pupil_id
    WHERE p.urlSlug = @urlSlug`
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
  const sql = `SELECT pupilColourContrasts_id FROM ${sqlService.adminSchema}.[pupilAccessArrangements]
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
  const result = await sqlService.query(sql, params)
  const row = R.head(result)
  return row && row['pupilColourContrasts_id']
}

pupilAccessArrangementsDataService.sqlFindPupilFontSizesId = async (pupilId, accessArrangementsId) => {
  const sql = `SELECT pupilFontSizes_id FROM ${sqlService.adminSchema}.[pupilAccessArrangements]
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
  const result = await sqlService.query(sql, params)
  const row = R.head(result)
  return row && row['pupilFontSizes_id']
}

module.exports = pupilAccessArrangementsDataService
