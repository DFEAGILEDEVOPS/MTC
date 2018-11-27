'use strict'
/* global describe, it, expect spyOn */

const azureQueueService = require('../../../services/azure-queue.service')
const pinGenerationDataService = require('../../../services/data-access/pin-generation.data.service')
const preparedCheckSyncService = require('../../../services/prepared-check-sync.service')

describe('preparedCheckSyncService', () => {
  describe('addMessages', () => {
    it('calls azureQueue service addMessage when active pin records are found', async () => {
      spyOn(pinGenerationDataService, 'sqlFindActivePinRecordsByUrlSlug').and.returnValue([{ checkCode: 'checkCode1' }, { checkCode: 'checkCode2' }])
      spyOn(azureQueueService, 'addMessage')
      await preparedCheckSyncService.addMessages('urlSlug')
      expect(pinGenerationDataService.sqlFindActivePinRecordsByUrlSlug).toHaveBeenCalled()
      expect(azureQueueService.addMessage).toHaveBeenCalled()
    })
    it('does not call azureQueue service addMessage when active pin records are not found', async () => {
      spyOn(pinGenerationDataService, 'sqlFindActivePinRecordsByUrlSlug').and.returnValue([])
      spyOn(azureQueueService, 'addMessage')
      await preparedCheckSyncService.addMessages('urlSlug')
      expect(pinGenerationDataService.sqlFindActivePinRecordsByUrlSlug).toHaveBeenCalled()
      expect(azureQueueService.addMessage).not.toHaveBeenCalled()
    })
  })
})
