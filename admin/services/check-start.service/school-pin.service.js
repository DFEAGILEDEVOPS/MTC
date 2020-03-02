'use strict'

const dataService = require('./data-access/school-pin.data.service')

const service = {
  /**
   * @description calls the school pin http service to allocate a school pin on demand
   * @param {uuid/v4} urlSlug the unique uuid of the school
   * @returns {string} generated school pin
   */
  generateSchoolPin: async (urlSlug) => {
    if (!urlSlug) {
      throw new Error('urlSlug is required')
    }
    const result = await dataService.callFunctionApi(urlSlug)
    if (!result || result.length !== 8) {
      throw new Error(`unable to generate pin for school.urlSlug:${urlSlug}`)
    }
  }
}

module.exports = service
