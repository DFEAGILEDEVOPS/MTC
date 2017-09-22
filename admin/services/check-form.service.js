'use strict'
const csv = require('fast-csv')
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
  },

  /**
   * Populate a Mongoose model with data from a CSV file
   * @param {CheckForm} checkForm Mongoose model
   * @param {String} absCsvFile Absolute path to csv file: e.g /home/abc/csvfile.csv
   * @return {Promise}
   */
  populateFromFile: function (checkForm, absCsvFile) {
    if (!checkForm) {
      throw new Error('Checkform arg missing')
    }

    if (!absCsvFile) {
      throw new Error('CSV file arg missing')
    }

    if (!checkForm.questions) {
      checkForm.questions = []
    }

    return new Promise(function (resolve, reject) {
      csv.fromPath(absCsvFile, { headers: false, trim: true })
        .validate((row) => {
          if (row[ 0 ] < 1 || row[ 0 ] > 12 || row[ 1 ] < 1 || row[ 1 ] > 12) {
            return false
          }
          if (row[ 0 ].match(/[^0-9]/) || row[ 1 ].match(/[^0-9]/)) {
            return false
          }
          // We expect 2, and only 2 columns
          if (row.length !== 2) {
            return false
          }
          return true
        })
        .on('data', function (row) {
          let q = {}
          q.f1 = parseInt(row[ 0 ], 10)
          q.f2 = parseInt(row[ 1 ], 10)
          checkForm.questions.push(q)
        })
        .on('data-invalid', function (row) {
          reject(new Error(`Row is invalid: [${row[ 0 ]}] [${row[ 1 ]}]`))
        })
        .on('end', function () {
          resolve(checkForm)
        })
        .on('error', function (error) {
          reject(error)
        })
    })
  }
}

module.exports = checkFormService
