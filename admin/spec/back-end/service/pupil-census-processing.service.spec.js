/* global spyOn, describe, it, expect */

const schoolDataService = require('../../../services/data-access/school.data.service')
const pupilCensusImportDataService = require('../../../services/data-access/pupil-census-import.data.service')
const pupilCensusProcessingService = require('../../../services/pupil-census-processing.service')

describe('pupilCensusProcessingService', () => {
  describe('process', () => {
    it('bulk imports pupil census data', async () => {
      spyOn(schoolDataService, 'sqlFindByDfeNumbers').and.returnValue([9991001, 9991002])
      spyOn(pupilCensusImportDataService, 'sqlBulkImport')
      await pupilCensusProcessingService.process([], 1)
      expect(schoolDataService.sqlFindByDfeNumbers).toHaveBeenCalled()
      expect(pupilCensusImportDataService.sqlBulkImport).toHaveBeenCalled()
    })
  })
})
