'use strict'

const CheckForm = require('../models/check-form')

const checkFormService = {
  /**
   * Allocate a check form
   * TODO: business logic
   * @return {Promise.<*>}
   */
  allocateCheckForm: async function () {
    // Until we determine the logic behind fetching the appropriate check form
    // the pupil will receive the first one
    // console.log('checkForm: ', CheckForm)
    const checkForm = await CheckForm.findOne({}).lean().exec()
    if (!checkForm) {
      throw new Error('CheckForm not found')
    }
    return checkForm
  },

  /**
   * Extract the questions from the check-form, and add an `order` property.
   * @param checkForm
   */
  prepareQuestionData: function (checkForm) {
    const {questions} = checkForm
    return questions.map((q, i) => { return {order: ++i, factor1: q.f1, factor2: q.f2} })
  },

  /**
   * Return question data for a pupil
   *
   * @return {Promise.<*>}
   */
  getQuestions: async function () {
    const cf = await this.allocateCheckForm()
    return this.prepareQuestionData(cf)
  }

}

module.exports = checkFormService
