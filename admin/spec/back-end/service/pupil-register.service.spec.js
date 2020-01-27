'use strict'

/* global describe expect it spyOn */

const pupilRegisterDataService = require('../../../services/data-access/pupil-register.data.service')
const pupilRegisterService = require('../../../services/pupil-register.service')

describe('pupil-register.service', () => {
  describe('#hasIncompleteChecks', () => {
    it('returns true if incomplete checks are found', async () => {
      spyOn(pupilRegisterDataService, 'getIncompleteChecks').and.returnValue([{ urlSlug: 1 }])
      const result = await pupilRegisterService.hasIncompleteChecks(42)
      expect(result).toBeTruthy()
    })
    it('returns false if incomplete checks are not found', async () => {
      spyOn(pupilRegisterDataService, 'getIncompleteChecks').and.returnValue([])
      const result = await pupilRegisterService.hasIncompleteChecks(42)
      expect(result).toBeFalsy()
    })
  })
})
