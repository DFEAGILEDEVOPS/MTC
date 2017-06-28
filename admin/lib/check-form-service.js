'use strict';
const csv = require('fast-csv');

let checkFormService = {};

/**
 *
 * @param {CheckForm} checkForm Mongoose model
 * @param {String} absCsvFile Absolute path to csv file: e.g /home/abc/csvfile.csv
 * @return {Promise}
 */
checkFormService.populateFromFile = async function(checkForm, absCsvFile) {

  if (!checkForm.questions) {
    checkForm.questions = [];
  }

  return new Promise(function (resolve, reject) {
    if (!checkForm) {
      reject(new Error('Checkform arg missing'));
    }

    if (!absCsvFile) {
      reject(new Error('CSV file arg missing'));
    }

    csv.fromPath(absCsvFile, {headers: false, trim: true})
      .validate( (row) => {
        if (row[0] < 1 || row[0] > 12 || row[1] < 1 || row[1] > 12) {
          return false;
        }
        if (row[0].match(/[^0-9]/) || row[1].match(/[^0-9]/)) {
          return false;
        }
        // We expect 2, and only 2 columns
        if (row.length !== 2) {
          return false;
        }
        return true;
      })
      .on('data', function (row) {
        let q = {};
        q.f1 = row[0];
        q.f2 = row[1];
        checkForm.questions.push(q);
      })
      .on('data-invalid', function(row) {
        reject(new Error(`Row is invalid: [${row[0]}] [${row[1]}]`));
      })
      .on('end', function () {
        resolve(checkForm);
      })
      .on('error', function (error) {
        reject(error);
      });
  });
};


module.exports = checkFormService;


