'use strict'

const checkFormDataService = require('./data-access/check-form.data.service')
const random = require('../lib/random-generator')

const checkFormService = {
  /**
   * Randomly allocate a form to a pupil, discarding all previously used forms
   * @param availableForms {Array.<Object>} -  the set of all forms (as objects) allocated to the check window
   * @param {Array.<number>} usedFormIds - the set of all form ids already used by the pupil
   * @return {Promise<object>} - one of the available forms
   */
  allocateCheckForm: async function (availableForms, usedFormIds) {
    if (!Array.isArray(availableForms)) {
      throw new Error('availableForms is not an array')
    }

    if (!Array.isArray(usedFormIds)) {
      throw new Error('usedFormIds is not an array')
    }

    if (!availableForms.length > 0) {
      throw new Error('There must be at least one form to select')
    }

    /**
     * Construct an array of unseen forms
     * @type Array
     */
    const unseenForms = availableForms.filter(f => !usedFormIds.includes(f.id))

    try {
      if (unseenForms.length === 0) {
        // The pupil has seen every form available
        if (availableForms.length === 1) {
          // Edge case when there is only 1 available form to choose from
          return availableForms[0]
        }
        // randomly pick a seen form as the pupil has seen all the forms
        const idx = await random.getRandomIntInRange(0, availableForms.length - 1)
        return availableForms[idx]
      } else if (unseenForms.length === 1) {
        // If there is only 1 unseen form left, it is not random and behaves predictably
        return unseenForms[0]
      }

      // We have multiple forms to choose from so we randomly select an unseen form
      const idx = await random.getRandomIntInRange(0, unseenForms.length - 1)
      return unseenForms[ idx ]
    } catch (error) {
      throw new Error('Error allocating checkForm: ' + error.message)
    }
  },

  /**
   * Return all forms allocated to a checkWindow, that can be assigned to a pupil
   */
  getAllFormsForCheckWindow: async function (checkWindowId) {
    return checkFormDataService.sqlFetchSortedActiveFormsByName(checkWindowId)
  },

  /**
   * Extract the questions from the check-form, and add an `order` property.
   * @param questions
   */
  prepareQuestionData: function (questions) {
    return questions.map((q, i) => { return {order: ++i, factor1: q.f1, factor2: q.f2} })
  }
}

module.exports = checkFormService
