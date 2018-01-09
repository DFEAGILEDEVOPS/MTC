'use strict'

const fs = require('fs')
const csv = require('fast-csv')
const moment = require('moment')
const config = require('../config')
const checkFormDataService = require('../services/data-access/check-form.data.service')
const checkWindowService = require('../services/check-window.service')

const checkFormService = {
  /**
   * Allocate a check form. This method is only used in check-start.service.
   * TODO: business logic
   * @returns {Promise.<*>}
   */
  allocateCheckForm: async function () {
    // Until we determine the logic behind fetching the appropriate check form
    // the pupil will receive the first.
    // UPDATE: There is a PBI to ensure randomness. This work is pending.
    const checkForm = await checkFormDataService.sqlGetActiveForm()
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
   * Populate a plain object with data from a CSV file
   * @param {object} checkForm object
   * @param {String} absCsvFile Absolute path to csv file: e.g /home/abc/csvfile.csv
   * @return {Promise}
   */
  populateFromFile: function (checkForm, absCsvFile) {
    if (!checkForm) {
      throw new Error('Check form arguments missing')
    }

    if (!absCsvFile) {
      throw new Error('CSV file arguments missing')
    }

    if (!checkForm.questions) {
      checkForm.questions = []
    }

    return new Promise(function (resolve, reject) {
      csv.fromPath(absCsvFile, { headers: false, trim: true })
        .on('readable', function () {
          if (checkFormService.isRowCountValid(absCsvFile) !== true) {
            reject(new Error(`Invalid number of lines`))
          }
        })
        .validate((row) => {
          if (row && row[0] && row[1]) {
            if (row[0] < 1 || row[0] > 12 || row[1] < 1 || row[1] > 12) {
              return false
            }
            if (row[0].match(/[^0-9]/) || row[1].match(/[^0-9]/)) {
              return false
            }
          }
          // We expect 2, and only 2 columns
          return row.length === 2
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
  },

  /**
   * Return a view friendly list of check-forms and their linked windows.
   * @param sortField
   * @param sortDirection
   * @returns {Promise.<*>}
   */
  formatCheckFormsAndWindows: async (sortField, sortDirection) => {
    let formData
    let sortByWindow = false
    let sortDescending = false

    if (sortField !== 'name') {
      sortByWindow = true
    }

    if (sortDirection !== 'asc') {
      sortDescending = true
    }

    if (sortByWindow) {
      formData = await checkFormDataService.sqlFetchSortedActiveFormsByWindow(sortDescending)
    } else {
      formData = await checkFormDataService.sqlFetchSortedActiveFormsByName(sortDescending)
    }

    if (formData.length > 0) {
      const checkWindows = await checkWindowService.getCheckWindowsAssignedToForms()
      formData.forEach(f => {
        f.removeLink = true
        if (checkWindows[f._id]) {
          f.checkWindows = checkWindows[f._id].map(cw => { return cw.checkWindowName })
          f.removeLink = moment(f.checkStartDate).isAfter(moment())
        } else {
          f.checkWindows = []
        }
      })

      formData.forEach(f => {
        f.checkWindows = f.checkWindows.join('<br>')
      })

      if (sortField === 'window') {
        formData = formData.sort((a, b) => {
          if (a.checkWindows === b.checkWindows) {
            return 0
          } else if (sortDirection === 'asc') {
            return a.checkWindows < b.checkWindows ? 1 : -1
          } else {
            return a.checkWindows < b.checkWindows ? -1 : 1
          }
        })
      }
    }
    return formData
  },

  /**
   * Un-assign check forms from check windows.
   * @param CheckWindow
   * @param CheckWindowsByForm
   * @returns {Promise.<void>}
   */
  // WARN this expects a CheckWindow but is passed a check form in controllers/check-form.js
  unassignedCheckFormsFromCheckWindows: async (CheckWindow, CheckWindowsByForm) => {
    if (CheckWindowsByForm[CheckWindow._id]) {
      // Array of CheckWindows models, each with a forms array
      let modifiedCheckWindows = []
      CheckWindowsByForm[CheckWindow._id].forEach(cw => {
        const index = cw.forms.indexOf(CheckWindow._id)
        if (index > -1) {
          cw.forms.splice(index, 1)
          modifiedCheckWindows.push(cw)
        }
      })
      // Update any changed check windows
      const promises = modifiedCheckWindows.map(cw => { cw.save() })
      return Promise.all(promises)
    }
  },

  /**
   * Return check windows name(s).
   * @param checkWindows
   * @returns {Array}
   */
  checkWindowNames: (checkWindows) => {
    let checkWindowsName = []
    checkWindows.forEach(cw => {
      checkWindowsName.push(' ' + cw.checkWindowName)
    })
    return checkWindowsName
  },

  /**
   * Return canDelete.
   * @param checkWindows
   * @returns {*}
   */
  canDelete: (checkWindows) => {
    let canDelete = false
    checkWindows.forEach(cw => {
      if (cw.checkStartDate > moment.utc()) {
        canDelete = true
      }
    })
    return canDelete
  },

  /**
   * Build a form name based on the file name.
   * @param fileName
   * @returns {boolean} or {string}
   */
  buildFormName: (fileName) => {
    const minFileNameSize = 5
    const maxFileNameSize = 131
    if (!fileName || fileName.length < minFileNameSize || fileName.length > maxFileNameSize) {
      return false
    }
    return fileName.slice(0, -4)
  },

  /**
   * Validate check form name. Check if it already exists.
   * @param formName
   * @returns {Promise<boolean>}
   */
  validateCheckFormName: async (formName) => {
    const checkFileName = await checkFormDataService.sqlFindCheckFormByName(formName)
    return !checkFileName ? formName : false
  },

  /**
   * Return true/false based on how many lines a file can have
   * @param file
   * @returns {boolean}
   */
  isRowCountValid: (file) => {
    let result
    let csvData = fs.readFileSync(file)
    result = csvData.toString().split('\n').map(function (line) {
      return line.trim()
    }).filter(Boolean)
    return result.length === config.LINES_PER_CHECK_FORM
  },

  /**
   * Get unassigned forms for selected check window.
   * @param checkWindowAssignedForms
   * @returns {Promise<*>}
   */
  getUnassignedFormsForCheckWindow: async (checkWindowAssignedForms) => {
    let checkFormData
    let checkFormList = []

    if (!checkWindowAssignedForms) {
      return []
    }
    const sortDescending = false
    checkFormData = await checkFormDataService.sqlFetchSortedActiveFormsByName(sortDescending)

    if (checkWindowAssignedForms && checkFormData) {
      checkFormData.map((form) => {
        if (checkWindowAssignedForms.filter(item => item === form._id).length < 1) {
          checkFormList.push({
            '_id': form._id,
            'name': form.name
          })
        }
      })
    }

    return checkFormList
  },

  /**
   * Get assigned forms for selected check window.
   * @param checkWindowAssignedForms
   * @returns {Promise<*>}
   */
  getAssignedFormsForCheckWindow: async (checkWindowAssignedForms) => {
    let checkFormData
    let checkFormList = []

    if (!checkWindowAssignedForms) {
      return []
    }
    const sortDescending = false
    checkFormData = await checkFormDataService.fetchSortedActiveFormsByName(sortDescending)

    if (checkWindowAssignedForms && checkFormData) {
      checkFormData.map((form) => {
        if (checkWindowAssignedForms.filter(item => item === form._id).length > 0) {
          checkFormList.push({
            '_id': form._id,
            'name': form.name
          })
        }
      })
    }

    return checkFormList
  },

  /**
   * Remove form id from array of current forms.
   * @param checkWindow
   * @param checkFormId
   * @returns {*}
   */
  removeFormIdFromArray: (checkWindow, checkFormId) => {
    if (!checkWindow) {
      return false
    }

    if (!checkFormId) {
      return false
    }

    let checkWindowForms = []

    if (checkWindow.forms.length > 0) {
      checkWindow.forms.map((f) => {
        if (parseInt(f) !== parseInt(checkFormId)) {
          checkWindowForms.push(f)
        }
      })
    }

    return checkWindowForms
  },

  deleteCheckForm: (id) => {
    // remove window assignments
    // mark as deleted
  }
}

module.exports = checkFormService
