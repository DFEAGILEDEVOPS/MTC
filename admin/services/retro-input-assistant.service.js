'use strict'

const validator = require('../lib/validator/retro-input-assistant-validator')
const dataService = require('./data-access/retro-input-assistant.data.service')
const validateUuid = require('uuid-validate')
const { PupilFrozenService } = require('./pupil-frozen/pupil-frozen.service')

const service = {
  /**
   * @typedef {object} retroInputAssistantData
   * @property {string} firstName
   * @property {string} lastName
   * @property {string} reason
   * @property {string} pupilUuid
   * @property {number} userId
   */

  /**
    * @description persists retrospective input assistant data
    * @param {retroInputAssistantData} retroInputAssistantData
    */
  save: async function save (retroInputAssistantData) {
    const validationResult = validator.validate(retroInputAssistantData)
    if (validationResult.hasError()) {
      throw validationResult
    }

    await PupilFrozenService.throwIfFrozenByUrlSlugs([retroInputAssistantData.pupilUuid])

    const pupilData = await dataService.getPupilIdAndCurrentCheckIdByUrlSlug(retroInputAssistantData.pupilUuid)
    if (!pupilData || pupilData.length === 0) {
      throw new Error('pupil lookup failed')
    }
    const pupilInfo = pupilData[0]

    if (!pupilInfo.id || pupilInfo.id < 1) {
      throw new Error(`invalid pupil.id returned from lookup: id:${pupilInfo.id}`)
    }

    if (!pupilInfo.currentCheckId || pupilInfo.currentCheckId < 1) {
      throw new Error(`invalid pupil.currentCheckId returned from lookup: id:${pupilInfo.currentCheckId}`)
    }

    await dataService.markLatestCompleteCheckAsInputAssistantAddedRetrospectively(pupilInfo.currentCheckId)

    const saveData = {
      firstName: retroInputAssistantData.firstName,
      lastName: retroInputAssistantData.lastName,
      reason: retroInputAssistantData.reason,
      pupilId: pupilInfo.id,
      userId: retroInputAssistantData.userId,
      checkId: pupilInfo.currentCheckId
    }
    return dataService.create(saveData)
  },
  /**
 * Returns pupils with eligible for access arrangements
 * @param {Number} schoolId
 * @returns {Promise<Array>}
 */
  getEligiblePupilsWithFullNames: async function getEligiblePupilsWithFullNames (schoolId) {
    if (!schoolId) {
      throw new Error('schoolId is not provided')
    }
    const pupils = await dataService.sqlFindEligiblePupilsBySchoolId(schoolId)
    return pupils.map(p => ({
      fullName: `${p.lastName}, ${p.foreName}${p.middleNames ? ' ' + p.middleNames : ''}`,
      urlSlug: p.urlSlug
    }))
  },
  /**
 * removes retro input assistant from pupils current check
 * @param {string} pupilUrlSlug
 * @returns {Promise<void>}
 */
  deleteFromCurrentCheck: async function deleteFromCurrentCheck (pupilUrlSlug) {
    if (!pupilUrlSlug) {
      throw new Error('pupilUrlSlug not provided')
    }
    if (!validateUuid(pupilUrlSlug)) {
      throw new Error('pupilUrlSlug is not a valid UUID')
    }
    await PupilFrozenService.throwIfFrozenByUrlSlugs([pupilUrlSlug])
    return dataService.deleteRetroInputAssistant(pupilUrlSlug)
  }
}

module.exports = service
