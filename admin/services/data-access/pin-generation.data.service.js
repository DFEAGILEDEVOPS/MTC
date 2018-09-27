'use strict'

const {TYPES} = require('tedious')
const sqlService = require('./sql.service')
const monitor = require('../../helpers/monitor')

const serviceToExport = {
  sqlFindEligiblePupilsBySchool: async (schoolId) => {
    const sql = `SELECT * FROM ${sqlService.adminSchema}.vewPupilPinGeneration WHERE school_id=@schoolId`
    const params = [
      {
        name: 'schoolId',
        value: schoolId,
        type: TYPES.Int
      }
    ]
    return sqlService.query(sql, params)
  }
}

module.exports = monitor('pin-generation.data.service', serviceToExport)
