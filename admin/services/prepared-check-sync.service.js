const azureQueueService = require('../services/azure-queue.service')
const pinGenerationDataService = require('../services/data-access/pin-generation.data.service')

const preparedCheckSyncService = {}

preparedCheckSyncService.addMessages = async (urlSlug) => {
  const results = await pinGenerationDataService.sqlFindActivePinRecordsByPupilUrlSlug(urlSlug)
  // Sync existing preparedCheck(s) when 1 or more active pins exist
  if (results.length > 0) {
    const checkCodes = results.map(r => r.checkCode)
    for (const checkCode of checkCodes) {
      await azureQueueService.addMessageAsync('prepared-check-sync', { version: 1, checkCode: checkCode })
    }
  }
}

module.exports = preparedCheckSyncService
