const accessArrangementsDataService = require('../services/data-access/access-arrangements.data.service')

const accessArrangementsService = {}

/**
 * Get access arrangements
 * @returns {Promise<Array>}
 */
accessArrangementsService.getAccessArrangements = async () => {
  return accessArrangementsDataService.sqlFindAccessArrangements()
}

module.exports = accessArrangementsService
