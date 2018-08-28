'use strict'

const { TYPES } = require('tedious')
const monitor = require('../../helpers/monitor')

const sqlService = require('./sql.service')
const pupilAccessArrangementsDataService = {}

/**
 * Find pupil access arrangements by pupil Id
 * @param {Number} pupilId
 * @returns {Promise<Object>}
 */
pupilAccessArrangementsDataService.sqlFindPupilAccessArrangementsByPupilId = async function (pupilId) {
  const sql = `
  SELECT
  *
  FROM ${sqlService.adminSchema}.[pupilAccessArrangements]
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
    pupil_id,
    recordedBy_user_id,
    accessArrangementsIdsWithCodes,
    questionReaderReasonCode,
    inputAssistanceInformation,
    questionReaderOtherInformation
  } = data

  const params = []
  const queries = []
  const inserts = []

  if (isUpdate) {
    params.push({
      name: `pupil_id`,
      value: pupil_id,
      type: TYPES.Int
    })
    queries.push(`DELETE ${sqlService.adminSchema}.[pupilAccessArrangements] WHERE pupil_id = @pupil_id`)
  }

  accessArrangementsIdsWithCodes.forEach((aa, idx) => {
    inserts.push(`(@pupil_id${idx}, @recordedBy_user_id${idx}, @accessArrangements_id${idx}, @questionReaderReasons_id${idx}, @inputAssistanceInformation${idx}, @questionReaderOtherInformation${idx})`)
    params.push({
      name: `pupil_id${idx}`,
      value: pupil_id,
      type: TYPES.Int
    })
    params.push({
      name: `recordedBy_user_id${idx}`,
      value: recordedBy_user_id,
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
      name: `questionReaderOtherInformation${idx}`,
      value: aa.code === 'QNR' && questionReaderReasonCode === 'OTH' ? questionReaderOtherInformation : '',
      type: TYPES.NVarChar
    })
  })

  const insertSql = `INSERT INTO ${sqlService.adminSchema}.[pupilAccessArrangements] (
      pupil_id, 
      recordedBy_user_id, 
      accessArrangements_id,
      questionReaderReasons_id,
      inputAssistanceInformation,
      questionReaderOtherInformation
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
  const sql =
    `SELECT p.urlSlug, p.foreName, p.middleNames, p.lastName, p.dateOfBirth, aa.description
  FROM ${sqlService.adminSchema}.pupilAccessArrangements paa
    INNER JOIN ${sqlService.adminSchema}.pupil p
      ON paa.pupil_id = p.id
    INNER JOIN ${sqlService.adminSchema}.school s
      ON p.school_id = s.id
    INNER JOIN ${sqlService.adminSchema}.accessArrangements aa
      ON aa.id = paa.accessArrangements_id
  WHERE s.dfeNumber = @dfeNumber
  ORDER BY p.lastName`
  return sqlService.query(sql, params)
}

module.exports = monitor('pupil-access-arrangements.data-service', pupilAccessArrangementsDataService)
