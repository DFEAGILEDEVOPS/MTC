'use strict'
const RA = require('ramda-adjunct')
const schoolService = require('./services/school.service')
const mapLimit = require('async/mapLimit')

const name = 'school-results-load-cache:v1'
const asyncLimit = 5 // number of async operations to do at a time

const v1 = {
  process: async (context) => {
    const logger = context.log
    const schools = await schoolService.retrieveAll()
    if (RA.isArray(schools) && schools.length) {
      logger(`${name} ${schools.length} schools to process`)
      schoolService.setLogger(context.log)
      const result = await mapLimit(schools, asyncLimit, schoolService.processOne)
      console.log('result', result)
      return {
        processCount: result.filter(o => o.success === true).length,
        errorCount: result.filter(o => o.success === false).length
      }
    }
  }
}

module.exports = v1
