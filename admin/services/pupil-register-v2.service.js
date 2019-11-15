'use strict'

const pupilRegisterV2DataService = require('./data-access/pupil-register-v2.data.service')
const pupilIdentificationFlagService = require('./pupil-identification-flag.service')

const pupilRegisterV2Service = {
  /**
   * Return the pupil register
   * @param schoolId
   * @return {Promise<*>}
   */
  getPupilRegister: async function (schoolId) {
    const pupilRegisterData = await pupilRegisterV2DataService.getPupilRegister(schoolId)
    const pupilRegister = pupilRegisterData.map(d => {
      return {
        urlSlug: d.urlSlug,
        foreName: d.foreName,
        lastName: d.lastName,
        middleNames: d.middleNames,
        dateOfBirth: d.dateOfBirth,
        group: d.groupName
      }
    })
    pupilIdentificationFlagService.addIdentificationFlags(pupilRegister)
    return pupilRegister
  }
}

module.exports = pupilRegisterV2Service
