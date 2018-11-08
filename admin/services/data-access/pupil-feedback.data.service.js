'use strict'

const sqlService = require('./sql.service')

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

module.exports = pupilFeedbackDataService
