'use strict'
const moment = require('moment')
const questions = [
  {'f1': 2, 'f2': 5},
  {'f1': 11, 'f2': 2},
  {'f1': 5, 'f2': 10},
  {'f1': 4, 'f2': 4},
  {'f1': 3, 'f2': 9},
]

module.exports = {
  checkFormAllocation_id: 1,
  checkFormAllocation_checkCode: '47D48E2C-DEA0-421A-9EBA-14CFC3AEE25C',
  pupil_id: 1,
  pupil_foreName: 'Juliana',
  pupil_lastName: 'Brewer',
  pupil_dateOfBirth: moment('2008-06-10T01:00:00.260'),
  pupil_jwtToken: '<someToken>',
  pupil_pin: '1234',
  checkForm_id: 1,
  checkForm_formData: JSON.stringify(questions),
  school_id: 1,
  school_name: 'Example School One',
  school_pin: 'bxx72dcd'
}
