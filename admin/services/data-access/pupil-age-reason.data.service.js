'use strict'

const { TYPES } = require('./sql.service')

const sqlService = require('./sql.service')
const pupilAgeReasonDataService = {}

/**
 * Insert pupil age reason record and link with pupil age reason id
 * @param {Number} pupilId
 * @param {String} reason
 * @returns {Promise<Array>}
 */
pupilAgeReasonDataService.sqlInsertPupilAgeReason = async function (pupilId, reason) {
  const sql = `
  INSERT INTO ${sqlService.adminSchema}.[pupilAgeReason]
  (pupil_id, reason)
  VALUES (@pupilId, @reason)
  
  UPDATE ${sqlService.adminSchema}.[pupil]
  SET pupilAgeReason_id = SCOPE_IDENTITY()
  WHERE id = @pupilId
  `

  const params = [
    {
      name: 'pupilId',
      value: pupilId,
      type: TYPES.Int
    },
    {
      name: 'reason',
      value: reason,
      type: TYPES.NVarChar
    }
  ]

  return sqlService.modify(sql, params)
}

/**
 * Update pupil age reason record
 * @param {Number} pupilId
 * @param {String} reason
 * @returns {Promise<Array>}
 */
pupilAgeReasonDataService.sqlUpdatePupilAgeReason = async function (pupilId, reason) {
  const sql = `
    UPDATE ${sqlService.adminSchema}.pupilAgeReason
    SET reason = @reason
    WHERE pupil_id = @pupilId
  `

  const params = [
    {
      name: 'pupilId',
      value: pupilId,
      type: TYPES.Int
    },
    {
      name: 'reason',
      value: reason,
      type: TYPES.NVarChar
    }
  ]

  return sqlService.modify(sql, params)
}

/**
 * Remove pupil age reason record
 * @param {Number} pupilId
 * @returns {Promise<Array>}
 */
pupilAgeReasonDataService.sqlRemovePupilAgeReason = async function (pupilId) {
  const sql = `
    UPDATE ${sqlService.adminSchema}.pupil
    SET pupilAgeReason_id = NULL
    WHERE id = @pupilId
  
    DELETE ${sqlService.adminSchema}.pupilAgeReason
    WHERE pupil_id = @pupilId
  `

  const params = [
    {
      name: 'pupilId',
      value: pupilId,
      type: TYPES.Int
    }
  ]

  return sqlService.modify(sql, params)
}

module.exports = pupilAgeReasonDataService
