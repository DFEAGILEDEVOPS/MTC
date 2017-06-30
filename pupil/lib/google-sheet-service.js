'use strict'

const GoogleSpreadsheet = require('google-spreadsheet')
const async = require('async')
let docKey = ''

/**
 * Spreadsheet key. Must enter one for production.
 */

docKey = process.env.GOOGLE_SVC_DOC_KEY

/**
 * @brief Submit the feedback form data to a Google Sheet
 * @param data Object containing keys that correspond to the header values in the Sheet and
 *             values to be added into the row cells.
 */
module.exports.addFeedback = function addFeedback (data) {
  let doc = new GoogleSpreadsheet(docKey)
  let sheet
  let creds = {
    client_email: process.env.GOOGLE_SVC_EMAIL,
    private_key: process.env.GOOGLE_SVC_PK.replace(/\\n/g, '\n')
  }

  // marshall async calls in a series
  async.series([
    function setAuth (error) {
      doc.useServiceAccountAuth(creds, error)
    },
    function getInfoAndWorksheets (error) {
      doc.getInfo(function (err, info) {
        if (err) {
          console.log('Error accessing document')
          return
        }
        sheet = info.worksheets[0]
        error()
      })
    },
    function appendToSheet (error) {
      data['date'] = (new Date()).toISOString()
      sheet.addRow(data, error)
    }
  ], error)
}

function error (error) {
  if (error) {
    console.log('Error submitting data to Google Sheet')
    console.log(error)
  }
}
