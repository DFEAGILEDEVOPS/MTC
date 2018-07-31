'use strict'
/* global describe, it, expect spyOn */

const accessArrangementsService = require('../../../services/access-arrangements.service')
const accessArrangementsDataService = require('../../../services/data-access/access-arrangements.data.service')

describe('accessArrangementsService', () => {
  describe('getAccessArrangements', () => {
    it('calls and return access arrangements list', async () => {
      const accessArrangements = [
        {
          id: 1,
          displayOrder: 1,
          description: 'description',
          code: 'COD'
        }
      ]
      spyOn(accessArrangementsDataService, 'sqlFindAccessArrangements').and.returnValue(accessArrangements)
      const result = await accessArrangementsService.getAccessArrangements()
      expect(accessArrangementsDataService.sqlFindAccessArrangements).toHaveBeenCalled()
      expect(result).toBe(accessArrangements)
    })
  })
})
