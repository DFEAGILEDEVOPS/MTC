/* global spyOn, describe, it, expect */

const sqlPoolService = require('../../services/data-access/sql.pool.service')
const schoolDataService = require('../../services/data-access/school.data.service')
const pupilDataService = require('../../services/data-access/pupil.data.service')
const pupilCensusProcessingService = require('../../services/pupil-census-processing.service')

describe('pupilCensusProcessingService', () => {
  describe('process', () => {
    it('bulk imports pupil census data', async () => {
      spyOn(sqlPoolService, 'getConnection')
      spyOn(schoolDataService, 'sqlFindByDfeNumbers').and.returnValue(9991001, 9991002)
      spyOn(pupilDataService, 'sqlBulkImport')
      await pupilCensusProcessingService.process([])
      expect(sqlPoolService.getConnection).toHaveBeenCalled()
      expect(schoolDataService.sqlFindByDfeNumbers).toHaveBeenCalled()
      expect(pupilDataService.sqlBulkImport).toHaveBeenCalled()
    })
  })
})
