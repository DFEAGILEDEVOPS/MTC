'use strict'
const RA = require('ramda-adjunct')
const config = require('../config')
const mapLimit = require('async/mapLimit')
const schoolService = require('./services/school.service')

const name = 'school-results-load-cache:v1'

const v1 = {
  process: async (context) => {
    const logger = context.log
    const schools = await schoolService.retrieveAll()
    if (RA.isArray(schools) && schools.length) {
      logger(`${name} ${schools.length} schools to process`)
      schoolService.setLogger(context.log)
      /** @var { {name:string, id:number, error:undefined|Error success:boolean}[] } result **/
      const result = await mapLimit(schools, config.SchoolResultsCacheLoadAsyncLimit, schoolService.processOne)
      return {
        processCount: result.filter(o => o.success === true).length,
        errorCount: result.filter(o => o.success === false).length
      }
    }
  }
}

module.exports = v1
