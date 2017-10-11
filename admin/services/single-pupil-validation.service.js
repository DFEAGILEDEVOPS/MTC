const { validate } = require('../lib/validator/pupil-validator')

module.exports.validate = async (single, school) => {
  const pupil = ({
    school: school._id,
    upn: single[ 3 ].trim().toUpperCase(),
    foreName: single[ 0 ],
    lastName: single[ 2 ],
    middleNames: single[ 1 ],
    gender: single[ 5 ],
    dob: single[ 4 ],
    pin: null,
    pinExpired: false
  })
  const dob = single[ 4 ].split('/')
  const pupilData = Object.assign({
    'dob-day': dob[ 0 ],
    'dob-month': dob[ 1 ],
    'dob-year': dob[ 2 ]
  }, pupil)
  const validationError = await validate(pupilData)
  if (validationError.hasError()) {
    single[ 6 ] = []
    Object.keys(validationError.errors).forEach((e) => single[ 6 ].push(validationError.errors[ e ]))
    single[ 6 ] = single[ 6 ].filter((err, i, arr) => arr.indexOf(err) === i).join(', ')
  }
  return { pupil, single }
}
