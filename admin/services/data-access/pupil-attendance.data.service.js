'use strict'

const {TYPES} = require('tedious')
const sqlService = require('./sql.service')
const R = require('ramda')
const winston = require('winston')

const table = '[pupilAttendance]'
const pupilAttendanceDataService = {}

pupilAttendanceDataService.sqlInsertBatch = async (ids, attendanceCodeId, userId) => {
  winston.debug('pupilAttendanceDataService.sqlInsertBatch: called')
  const insert = `INSERT INTO ${sqlService.adminSchema}.${table} (
     pupil_id, 
     recordedBy_user_id, 
     attendanceCode_id
   ) VALUES `

  const insertsClauses = []
  const params = []
  params.push({ name: 'userId', type: TYPES.Int, value: userId })
  params.push({ name: 'attendanceCode', type: TYPES.Int, value: attendanceCodeId })

  for (let i = 0; i < ids.length; i++) {
    insertsClauses.push(`(@p${i}, @userId, @attendanceCode)`)
    params.push({ name: `p${i}`, type: TYPES.Int, value: ids[i] })
  }

  const valuesSql = insertsClauses.join(', ')
  const sql = [insert, valuesSql].join(' ')
  return sqlService.modify(sql, params)
}

pupilAttendanceDataService.sqlUpdateBatch = async (pupilIds, attendanceCodeId, userId) => {
  const update = `UPDATE ${sqlService.adminSchema}.${table}
    SET 
      attendanceCode_id = @attendanceCodeId, 
      recordedBy_user_id = @userId
  `

  const params = [
    { name: 'attendanceCodeId', type: TYPES.Int, value: attendanceCodeId },
    { name: 'userId', type: TYPES.Int, value: userId }
  ]

  const where = sqlService.whereClauseHelper(pupilIds, TYPES.Int)
  const whereClause = 'WHERE pupil_id IN (' + where.paramIdentifiers.join(', ') + ')'
  const sql = [update, whereClause].join(' ')
  return sqlService.modify(sql, R.concat(params, where.params))
}

pupilAttendanceDataService.sqlDeleteOneByPupilId = async (pupilId) => {
  if (!pupilId) {
    throw new Error('pupilId is required for a DELETE')
  }
  const sql = `
  DELETE FROM ${sqlService.adminSchema}.${table}
  WHERE pupil_id = @pupilId`
  const param = { name: 'pupilId', value: pupilId, type: TYPES.Int }
  return sqlService.modify(sql, [param])
}

pupilAttendanceDataService.findByPupilIds = async (ids) => {
  const select = `
  SELECT *
  FROM ${sqlService.adminSchema}.${table}
  `
  const {params, paramIdentifiers} = sqlService.whereClauseHelper(ids, TYPES.Int)
  const whereClause = 'WHERE pupil_id IN (' + paramIdentifiers.join(', ') + ')'
  const sql = [select, whereClause].join(' ')
  return sqlService.query(sql, params)
}

module.exports = pupilAttendanceDataService
