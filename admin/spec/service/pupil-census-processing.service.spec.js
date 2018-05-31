/* global spyOn, describe, it, expect */

const schoolDataService = require('../../services/data-access/school.data.service')
const pupilDataService = require('../../services/data-access/pupil.data.service')
const pupilCensusProcessingService = require('../../services/pupil-census-processing.service')

describe('pupilCensusProcessingService', () => {
  describe('process', () => {
    it('bulk imports pupil census data', async () => {
      spyOn(schoolDataService, 'sqlFindByDfeNumbers').and.returnValue(9991001, 9991002)
      spyOn(pupilDataService, 'sqlBulkImport')
      await pupilCensusProcessingService.process([])
      expect(schoolDataService.sqlFindByDfeNumbers).toHaveBeenCalled()
      expect(pupilDataService.sqlBulkImport).toHaveBeenCalled()
    })
  })
})
