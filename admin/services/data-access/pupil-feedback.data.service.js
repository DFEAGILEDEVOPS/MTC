'use strict'

const PupilFeedback = require('../../models/pupil-feedback')
const pupilFeedbackDataService = {

  /**
   * CREATE a new pupil-feedback record
   * @param data
   * @return {Promise<*>}
   */
  create: async (data) => {
    const pf = new PupilFeedback(data)
    await pf.save()
    return pf.toObject()
  }
}

module.exports = pupilFeedbackDataService
