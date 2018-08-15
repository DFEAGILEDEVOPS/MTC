'use strict'

const { TYPES } = require('tedious')
const R = require('ramda')
const monitor = require('../../helpers/monitor')

const sqlService = require('./sql.service')
const pupilAccessArrangementsDataService = {}

/**
 * Find pupil access arrangement by pupil Id
 * @param {Number} pupilId
 * @returns {Object}
 */
pupilAccessArrangementsDataService.sqlFindPupilAccessArrangementsByPupilId = async function (pupilId) {
  const sql = `
  SELECT TOP 1 
  *
  FROM ${sqlService.adminSchema}.[pupilAccessArrangements]
  WHERE pupil_id = @pupilId`
  const params = [
    { name: 'pupilId', type: TYPES.Int, value: pupilId }
  ]
  const result = await sqlService.query(sql, params)
  return R.head(result)
}

/**
 * Create a new pupil access arrangement.
 * @param {object} data
 * @return {Promise<Object>}
 */
pupilAccessArrangementsDataService.sqlCreate = async (data) => {
  return sqlService.create('[pupilAccessArrangements]', data)
}

/**
 * Update a pupil access arrangement.
 * @param {object} data
 * @return {Promise<Object>}
 */
pupilAccessArrangementsDataService.sqlUpdate = async (data) => {
  const {
    pupil_id,
    recordedBy_user_id,
    accessArrangements_ids,
    questionReaderReasons_id,
    inputAssistanceInformation,
    questionReaderOtherInformation
  } = data
  const params = [
    {
      name: 'pupil_id',
      value: pupil_id,
      type: TYPES.Int
    },
    {
      name: 'recordedBy_user_id',
      value: recordedBy_user_id,
      type: TYPES.Int
    },
    {
      name: 'accessArrangements_ids',
      value: accessArrangements_ids,
      type: TYPES.NVarChar
    },
    {
      name: 'questionReaderReasons_id',
      value: questionReaderReasons_id,
      type: TYPES.Int
    },
    {
      name: 'inputAssistanceInformation',
      value: inputAssistanceInformation,
      type: TYPES.NVarChar
    },
    {
      name: 'questionReaderOtherInformation',
      value: questionReaderOtherInformation,
      type: TYPES.NVarChar
    }
  ]
  const sql = `UPDATE ${sqlService.adminSchema}.[pupilAccessArrangements] 
  SET
  recordedBy_user_id = @recordedBy_user_id,
  accessArrangements_ids= @accessArrangements_ids,
  questionReaderReasons_id= @questionReaderReasons_id,
  inputAssistanceInformation= @inputAssistanceInformation,
  questionReaderOtherInformation= @questionReaderOtherInformation
  WHERE pupil_id=@pupil_id`
  return sqlService.modify(sql, params)
}

module.exports = monitor('pupil-access-arrangements.data-service', pupilAccessArrangementsDataService)
