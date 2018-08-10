'use strict'
const {TYPES} = require('tedious')
const sqlService = require('./sql.service')
const monitor = require('../../helpers/monitor')

const pupilCensusDataService = {
  sqlDeletePupilsByJobId: async (jobId) => {
    const sql = `DELETE FROM ${sqlService.adminSchema}.[pupil] WHERE job_id=@jobId`
    const params = [
      {
        name: 'jobId',
        value: jobId,
        type: TYPES.Int
      }
    ]
    return sqlService.modify(sql, params)
  }
}

module.exports = monitor('pupilCensus.data-service', pupilCensusDataService)
