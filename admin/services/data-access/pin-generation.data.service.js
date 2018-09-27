'use strict'

const {TYPES} = require('tedious')
const sqlService = require('./sql.service')
const monitor = require('../../helpers/monitor')

const serviceToExport = {
  sqlFindEligiblePupilsBySchool: async (dfeNumber) => {
    const sql = `SELECT * FROM ${sqlService.adminSchema}.vewPupilPinGeneration WHERE dfeNumber=@dfeNumber`
    const params = [
      {
        name: 'dfeNumber',
        value: dfeNumber,
        type: TYPES.Int
      }
    ]
    return sqlService.query(sql, params)
  }
}

module.exports = monitor('pin-generation.data.service', serviceToExport)
