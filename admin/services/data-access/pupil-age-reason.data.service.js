'use strict'

const { TYPES } = require('./sql.service')

const sqlService = require('./sql.service')
const pupilAgeReasonDataService = {}

/**
 * Insert pupil age reason record and link with pupil age reason id
 * @param {number} pupilId
 * @param {string} reason
 * @param {number} userId
 * @returns {Promise<Array>}
 */
pupilAgeReasonDataService.sqlInsertPupilAgeReason = async function (pupilId, reason, userId) {
  const sql = `
  INSERT INTO [mtc_admin].[pupilAgeReason]
  (pupil_id, reason, lastUpdatedBy_userId, recordedBy_userId)
  VALUES (@pupilId, @reason, @userId, @userId)

  UPDATE [mtc_admin].[pupil]
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
    },
    {
      name: 'userId',
      value: userId,
      type: TYPES.Int
    }
  ]

  return sqlService.modifyWithTransaction(sql, params)
}

/**
 * Update pupil age reason record
 * @param {number} pupilId
 * @param {string} reason
 * @param {number} userId
 * @returns {Promise<Array>}
 */
pupilAgeReasonDataService.sqlUpdatePupilAgeReason = async function (pupilId, reason, userId) {
  const sql = `
    UPDATE [mtc_admin].pupilAgeReason
    SET reason = @reason, lastUpdatedBy_userId = @userId
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
    },
    {
      name: 'userId',
      value: userId,
      type: TYPES.Int
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
    UPDATE [mtc_admin].pupil
    SET pupilAgeReason_id = NULL
    WHERE id = @pupilId;

    DELETE [mtc_admin].pupilAgeReason
    WHERE pupil_id = @pupilId;
  `

  const params = [
    {
      name: 'pupilId',
      value: pupilId,
      type: TYPES.Int
    }
  ]

  return sqlService.modifyWithTransaction(sql, params)
}

module.exports = pupilAgeReasonDataService
