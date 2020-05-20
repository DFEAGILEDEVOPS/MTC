'use strict'

const resultsService = require('./service/results.service.js')
// TODO: add logger service

const service = {
  /**
   * Process a school - fetch the data from Table Storage and save it in SQL DB
   * @param {id: number, name: string, schoolGuid: string} school
   * @return {Promise<Number>}
   */
  processSchool: async function processSchool (school) {
    // Find all outstanding checks in the school
    const newChecks = await resultsService.getNewChecks(school.id)
    const markedChecks = await resultsService.getSchoolResults(school.schoolGuid)
    const newMarkedChecks = await resultsService.findNewMarkedChecks(newChecks, markedChecks)
    await resultsService.persistMarkingData(newMarkedChecks)
    return newChecks.length
  },

  /**
   * Entry point for the module.  Will find all schools with new checks and then copy the marking results to sql server
   * @return {Promise<{}>}
   */
  process: async function process () {
    // find all schools with new checks to process
    const schools = await resultsService.getSchoolsWithNewChecks()
    const meta = { schoolsProcessed: schools.length, checksProcessed: 0, errors: 0 }
    for (const school of schools) {
      console.log(`Processing school [${school.id}] ${school.name}`)
      try {
        const numChecksProccessed = await this.processSchool(school)
        meta.checksProcessed += numChecksProccessed
      } catch (error) {
        console.error(`Error processing school [${school.id}] ${school.name}`, error)
        meta.errors += 1
      }
    }
    return meta
  }
}

module.exports = service
