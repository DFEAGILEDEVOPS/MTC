'use strict'

const sqlService = require('./sql.service')
const monitor = require('../../helpers/monitor')

const pupilFeedbackDataService = {
  /**
   * create new pupilFeedback record
   * @param data a JSON object containing the following: inputType:int, satisfactionRating:tinyint, comments:string, id:int
   * @return {Promise<*>}
   */
  sqlCreate: async (data) => {
    return sqlService.create('[pupilFeedback]', data)
  }
}

module.exports = monitor('pupilFeedback.data-service', pupilFeedbackDataService)
