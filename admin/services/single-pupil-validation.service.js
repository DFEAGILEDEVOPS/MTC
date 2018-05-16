const pupilValidator = require('../lib/validator/pupil-validator')
const moment = require('moment')
const R = require('ramda')
const addPupilErrorMessages = require('../lib/errors/pupil').addPupil

// Warning: some state is built up in this variable.  Please be sure to call `init()` before calling `validate()`
let seenUpns = {}

module.exports = {

  /**
   * Initialise the state to get a clean run - NB always call this function before `validate()`
   */
  init: () => {
    seenUpns = {}
  },

  /**
   * Validate a single pupil record
   * @param {Array} pupilCsvData - pupilCsvData pupil row data from csv.  ['lastName', 'foreName', 'middleNames', 'dateOfBirth', 'gender', 'upn']
   * @param {object} school
   * @return {Promise<{pupil: {school_id, upn: string, foreName: *, lastName: *, middleNames: *, gender: *, dateOfBirth: Date}, pupilCsvData: *}>}
   */
  validate: async (pupilCsvData, school) => {
    const p = ({
      school_id: school.id,
      upn: pupilCsvData[ 5 ].trim().toUpperCase(),
      foreName: pupilCsvData[ 1 ],
      lastName: pupilCsvData[ 0 ],
      middleNames: pupilCsvData[ 2 ],
      gender: pupilCsvData[ 4 ],
      dateOfBirth: moment(pupilCsvData[ 3 ], 'DD/MM/YYYY').toDate()
    })
    const dob = pupilCsvData[ 3 ].split('/')
    const pupil = Object.assign({
      'dob-day': dob[ 0 ] || '',
      'dob-month': dob[ 1 ] || '',
      'dob-year': dob[ 2 ] || ''
    }, p)
    const validationError = await pupilValidator.validate(pupil)

    // Check for duplicate UPNs with the batch file
    if (R.prop(p.upn, seenUpns)) {
      // Duplicate UPN
      validationError.addError('upn', addPupilErrorMessages.upnDuplicate)
    }

    // Store the UPN so we can check for duplicates
    seenUpns[p.upn] = true

    if (validationError.hasError()) {
      pupilCsvData[ 6 ] = []
      Object.keys(validationError.errors).forEach((e) => pupilCsvData[ 6 ].push(validationError.errors[ e ]))
      pupilCsvData[ 6 ] = pupilCsvData[ 6 ].filter((err, i, arr) => arr.indexOf(err) === i).join(', ')
    }
    return { pupil: p, single: pupilCsvData }
  }
}
