'use strict'

const csv = require('fast-csv')
const fs = require('fs')
const moment = require('moment')

const checkFormDataService = require('../services/data-access/check-form.data.service')
const checkWindowService = require('../services/check-window.service')
const config = require('../config')
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
   * create a check form
   * @param form the form as an object
   */
  create: async (form) => {
    return checkFormDataService.sqlCreate(form)
  },

  /**
   * Get a non-deleted form
   * @param formId the id of the form
   */
  getCheckForm: async (formId) => {
    let form = await checkFormDataService.sqlFindActiveForm(formId)
    if (form && form.length > 0) {
      form = form[0]
      form.questions = JSON.parse(form.formData)
    }
    return form
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
  },

  /**
   * Populate a plain object with data from a CSV file
   * @param {object} checkForm object
   * @param {String} absCsvFile Absolute path to csv file: e.g /home/abc/csvfile.csv
   * @return {Promise}
   */
  populateFromFile: function (checkForm, absCsvFile) {
    if (!checkForm) {
      throw new Error('Check form argument missing')
    }

    if (!absCsvFile) {
      throw new Error('CSV file argument missing')
    }
    const checkFormData = []

    return new Promise(function (resolve, reject) {
      csv.fromPath(absCsvFile, { headers: false, trim: true })
        .on('readable', function () {
          if (checkFormService.isRowCountValid(absCsvFile) !== true) {
            reject(new Error(`Invalid number of lines:`))
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
          checkFormData.push(q)
        })
        .on('data-invalid', function (row) {
          reject(new Error(`Row is invalid: [${row[ 0 ]}] [${row[ 1 ]}]`))
        })
        .on('end', function () {
          checkForm.formData = JSON.stringify(checkFormData)
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
      formData = await checkFormDataService.sqlFetchSortedActiveFormsByWindow(null, sortDescending)
    } else {
      formData = await checkFormDataService.sqlFetchSortedActiveFormsByName(null, sortDescending)
    }

    if (formData.length > 0) {
      for (let index = 0; index < formData.length; index++) {
        const form = formData[index]
        form.removeLink = true
        const checkWindows = await checkWindowService.getCheckWindowsAssignedToForms([form.id])
        if (checkWindows.length > 0) {
          form.checkWindows = checkWindows.map(cw => cw.name)
          form.removeLink = moment(form.checkStartDate).isAfter(moment())
        } else {
          form.checkWindows = []
        }
      }
      // TODO - why on earth does a service have a view concern inside it?
      // TODO - this must be moved to the view
      formData.forEach(f => {
        f.checkWindows = f.checkWindows.join('<br>')
      })

      // TODO rereview server side sorting after SQL move.
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
   * @returns {Promise.<*>}
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
   * Un-assign check form from check window.
   * @param formId the check form to remove
   * @returns {Promise.<void>}
   */
  deleteCheckForm: async (formId) => {
    // remove assignments from windows
    await checkFormDataService.sqlRemoveAllWindowAssignments(formId)
    // mark as deleted
    return checkFormDataService.sqlMarkFormAsDeleted(formId)
  },

  /**
   * Return check windows name(s).
   * @param checkWindows
   * @returns {Array}
   */
    // TODO why is there functionality for check windows in the check form service?????
  checkWindowNames: (checkWindows) => {
    let checkWindowsName = []
    checkWindows.forEach(cw => {
      checkWindowsName.push(' ' + cw.name)
    })
    return checkWindowsName
  },

  /**
   * Return canDelete.
   * @param checkWindows
   * @returns {*}
   */
  // TODO why is there functionality for check windows in the check form service?????
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
   * Validate check form name. Returns true if not already in use
   * @param formName
   * @returns {Promise<boolean>}
   */
  validateCheckFormName: async (formName) => {
    const matchingFileNames = await checkFormDataService.sqlFindCheckFormByName(formName)
    return matchingFileNames.length === 0
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
  getUnassignedFormsForCheckWindow: async (windowId) => {
    return checkFormDataService.sqlFetchSortedActiveFormsNotAssignedToWindowByName(windowId)
  },

  /**
   * Get assigned forms for selected check window.
   * @param checkWindowAssignedForms
   * @returns {Promise<*>}
   */
  getAssignedFormsForCheckWindow: async (windowId) => {
    const sortDescending = false
    return checkFormDataService.sqlFetchSortedActiveFormsByName(windowId, sortDescending)
  },

  removeWindowAssignment: async (formId, windowId) => {
    return checkFormDataService.sqlRemoveWindowAssignment(formId, windowId)
  }
}

module.exports = checkFormService
