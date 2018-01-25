'use strict'

const PupilFeedback = require('../../models/pupil-feedback')
const sqlService = require('./sql.service')

const pupilFeedbackDataService = {

  /**
   * CREATE a new pupil-feedback record
   * @deprecated use sqlCreate
   * @param data
   * @return {Promise<*>}
   */
  create: async (data) => {
    const pf = new PupilFeedback(data)
    await pf.save()
    return pf.toObject()
  },

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
