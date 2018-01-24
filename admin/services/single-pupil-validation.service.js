const pupilValidator = require('../lib/validator/pupil-validator')
const moment = require('moment')

/**
 *
 * @param single
 * @param {object} school
 * @return {Promise<{pupil: {school_id, upn: string, foreName: *, lastName: *, middleNames: *, gender: *, dateOfBirth: Date}, single: *}>}
 */
module.exports.validate = async (single, school) => {
  const pupil = ({
    school_id: school.id,
    upn: single[ 5 ].trim().toUpperCase(),
    foreName: single[ 1 ],
    lastName: single[ 0 ],
    middleNames: single[ 2 ],
    gender: single[ 4 ],
    dateOfBirth: moment(single[ 3 ], 'DD/MM/YYYY').toDate()
  })
  const dob = single[ 3 ].split('/')
  const pupilData = Object.assign({
    'dob-day': dob[ 0 ] || '',
    'dob-month': dob[ 1 ] || '',
    'dob-year': dob[ 2 ] || ''
  }, pupil)
  const validationError = await pupilValidator.validate(pupilData)
  if (validationError.hasError()) {
    single[ 6 ] = []
    Object.keys(validationError.errors).forEach((e) => single[ 6 ].push(validationError.errors[ e ]))
    single[ 6 ] = single[ 6 ].filter((err, i, arr) => arr.indexOf(err) === i).join(', ')
  }
  return { pupil, single }
}
