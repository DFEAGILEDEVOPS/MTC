const questionReaderReasonsDataService = require('../services/data-access/question-reader-reasons.data.service')

const questionReaderReasonsService = {}

/**
 * Get question reader reasons
 * @returns {Promise<Array>}
 */
questionReaderReasonsService.getQuestionReaderReasons = async () => {
  return questionReaderReasonsDataService.sqlFindQuestionReaderReasons()
}

module.exports = questionReaderReasonsService
