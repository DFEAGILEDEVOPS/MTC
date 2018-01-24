'use strict'

const R = require('ramda')

const Check = require('../../models/check')
const sqlService = require('./sql.service')
const TYPES = require('tedious').TYPES

const checkDataService = {}

/**
 * Find a Check and return the lean model
 * @param checkCode
 * @deprecated
 * @return {Promise}
 */
checkDataService.findOneByCheckCode = async function (checkCode) {
  return Check.findOne({checkCode}).lean().exec()
}

/**
 * Find a Check by its checkCode UUID
 * @param checkCode *
 * @return {Promise}
 */
checkDataService.sqlFindOneByCheckCode = async function (checkCode) {
  const params = [
    {
      name: 'checkCode',
      value: checkCode,
      type: TYPES.UniqueIdentifier
    }
  ]
  return sqlService.query(`SELECT * FROM ${sqlService.adminSchema}.[check] WHERE checkCode=@checkCode`, params)
}

/**
 * Find Checks by criteria: e.g. checkDataService.find({checkWindowId: 1234})
 * @param criteria
 * @deprecated
 * @return {Promise.<*>} - lean Check objects
 */
checkDataService.find = async function (criteria) {
  return Check.find(criteria).lean().exec()
}

/**
 * Find latest checks by criteria: e.g. checkDataService.findOne({checkWindowId: 1234})
 * @param criteria
 * @deprecated
 * @return {Promise.<void>} - lean Check objects
 */
checkDataService.findLatestCheck = async function (criteria) {
  const checks = await Check.find(criteria).sort({ _id: -1 }).lean().exec()
  return checks[0]
}

/**
 * Find latest check for pupil
 * @param pupilId - the pupil taking the check
 * @param started - if true returns latest started check only
 * @return {Promise.<void>} - lean Check objects
 */
checkDataService.sqlFindLatestCheck = async function (pupilId, started) {
  let sql = `SELECT * FROM ${sqlService.adminSchema}.[check] WHERE pupil_id = @pupilId`
  if (started) {
    sql = sql + ' AND startedAt IS NOT NULL'
  }
  const params = [
    {
      name: 'pupilId',
      value: pupilId,
      type: TYPES.Int
    }
  ]
  return sqlService.query(sql, params)
}

/**
 * Find Checks by criteria: e.g. checkDataService.find({checkWindowId: 1234})
 * @param criteria
 * @deprecated
 * @return {Promise.<object>} - lean Check objects, fully populated
 * This includes the pupil (includes the school), checkWindow, and checkForm.  This is fairly efficient
 * involving 1 extra query per document set per sub-document.  The whole lot is done in 5 queries total.
 */
checkDataService.findFullyPopulated = async function (criteria) {
  return Check.find(criteria)
    .populate({path: 'pupilId', populate: {path: 'school'}})
    .populate('checkWindowId')
    .populate('checkFormId')
    .lean()
    .exec()
}

/**
 * Find Checks and associated data by checkCode
 * @param checkCodes - array of UUID
 * @return {Promise.<void>} - lean Check objects, fully populated
 * This includes the pupil (includes the school), checkWindow, and checkForm.  This is fairly efficient
 * involving 1 extra query per document set per sub-document.
 */
checkDataService.sqlFindFullyPopulated = async function (checkCodes) {
  let sql = `SELECT * FROM ${sqlService.adminSchema}.[check] chk INNER JOIN ${sqlService.adminSchema}.pupil pup ON pup.id = chk.pupil_id
   INNER JOIN ${sqlService.adminSchema}.school sch ON sch.id = pup.school_id
   INNER JOIN ${sqlService.adminSchema}.checkWindow wdw ON wdw.id = chk.checkWindow_id
   INNER JOIN ${sqlService.adminSchema}.checkForm frm ON frm.id = chk.checkForm_id`
  let whereClause = ' WHERE chk.checkCode IN ('
  const params = []
  for (let index = 0; index < checkCodes.length; index++) {
    whereClause = whereClause + `@p${index}`
    if (index < checkCodes.length - 1) {
      whereClause += ','
    }
    params.push({
      name: `p${index}`,
      value: checkCodes[index],
      type: TYPES.UniqueIdentifier
    })
  }
  whereClause = whereClause + ')'
  sql = sql + whereClause
  return sqlService.query(sql, params)
}

/**
 * Find the count
 * @param query
 * @deprecated
 * @return {Promise.<*>}
 */
checkDataService.count = async function (query) {
  return Check.count(query).exec()
}

/**
 * replaces mongo count implementation
 * returns number of checks started by specified pupil
 * @param pupilId
 * @return {Promise.<*>}
 */
checkDataService.sqlFindNumberOfChecksStartedByPupil = async function (pupilId) {
  const sql = `SELECT COUNT(*) AS [cnt] FROM ${sqlService.adminSchema}.[check]
  WHERE pupil_id=@pupilId AND startedAt IS NOT NULL
  AND DATEDIFF(day, createdAt, GETUTCDATE()) = 0`
  const params = [
    {
      name: 'pupilId',
      value: pupilId,
      type: TYPES.Int
    }
  ]
  const result = await sqlService.query(sql, params)
  const obj = R.head(result)
  return R.prop('cnt', obj)
}

/**
 * Generalised update function - use with care
 * @param query
 * @deprecated
 * @param criteria
 * @return {Promise}
 */
checkDataService.update = async function (query, criteria) {
  return new Promise((resolve, reject) => {
    Check.updateOne(query, criteria, (error) => {
      if (error) { return reject(error) }
      resolve(null)
    })
  })
} // NOTE: broken down into 2 specific sql methods

checkDataService.sqlUpdateCheckStartedAt = async (checkCode, startedAt) => {
  const sql = `UPDATE ${sqlService.adminSchema}.[check] SET startedAt=@startedAt WHERE checkCode=@checkCode AND startedAt IS NULL`
  const params = [
    {
      name: 'startedAt',
      value: startedAt,
      type: TYPES.DateTimeOffset
    },
    {
      name: 'checkCode',
      value: checkCode,
      type: TYPES.UniqueIdentifier
    }
  ]
  return sqlService.modify(sql, params)
}

checkDataService.sqlUpdateCheckWithResults = async (checkCode, mark, maxMark, markedAt) => {
  const sql = `UPDATE ${sqlService.adminSchema}.[check] SET mark=@mark, maxMark=@maxMark, markedAt=@markedAt WHERE checkCode=@checkCode`
  const params = [
    {
      name: 'checkCode',
      value: checkCode,
      type: TYPES.UniqueIdentifier
    },
    {
      name: 'mark',
      value: mark,
      type: TYPES.TinyInt
    },
    {
      name: 'maxMark',
      value: maxMark,
      type: TYPES.TinyInt
    },
    {
      name: 'markedAt',
      value: markedAt,
      type: TYPES.DateTimeOffset
    }
  ]
  return sqlService.modify(sql, params)
}

/**
 * Create a new Check
 * @param data
 * @deprecated
 * @return {Promise}
 */
checkDataService.create = async function (data) {
  const check = new Check(data)
  return check.save()
}

/**
 * Create a new Check
 * @param check
 * @return {Promise}
 */
checkDataService.sqlCreate = async function (check) {
  return sqlService.create('[check]', check)
}

/**
 * Find the latest check for pupil
 * @param pupilId - the pupil taking the check
 * @return {Promise.<void>} - lean Check objects
 */
checkDataService.sqlFindLastStartedCheckByPupilId = async function (pupilId) {
  let sql = `SELECT TOP 1 * FROM ${sqlService.adminSchema}.[check] WHERE pupil_id = @pupilId
    AND startedAt IS NOT NULL ORDER BY startedAt DESC`

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

module.exports = checkDataService
