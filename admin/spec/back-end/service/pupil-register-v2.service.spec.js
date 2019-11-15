'use strict'

/* global describe expect it beforeEach spyOn */

const pupilRegisterV2Service = require('../../../services/pupil-register-v2.service')
const pupilRegisterV2DataService = require('../../../services/data-access/pupil-register-v2.data.service')
const pupilIdentificationFlagService = require('../../../services/pupil-identification-flag.service')

describe('pupil-register-v2.service', () => {
  describe('#getPupilRegister', () => {
    beforeEach(() => {
      spyOn(pupilRegisterV2DataService, 'getPupilRegister').and.returnValue([])
      spyOn(pupilIdentificationFlagService, 'addIdentificationFlags')
    })
    it('calls the data service to get the raw data', async () => {
      await pupilRegisterV2Service.getPupilRegister(42)
      expect(pupilRegisterV2DataService.getPupilRegister).toHaveBeenCalled()
    })
    it('calls the pupil identification flag service', async () => {
      await pupilRegisterV2Service.getPupilRegister(42)
      expect(pupilIdentificationFlagService.addIdentificationFlags).toHaveBeenCalled()
    })
  })
})
