'use strict'
const moment = require('moment')
const questions = [
  { f1: 2, f2: 5 },
  { f1: 11, f2: 2 },
  { f1: 5, f2: 10 },
  { f1: 4, f2: 4 },
  { f1: 3, f2: 9 }
]

module.exports = {
  pupil_id: 1,
  check_checkCode: '47D48E2C-DEA0-421A-9EBA-14CFC3AEE25C',
  school_pin: 'bxx72dcd',
  pupil_pin: '1234',
  pupil_foreName: 'Juliana',
  pupil_lastName: 'Brewer',
  check_isLiveCheck: true,
  check_check_id: 123,
  pupil_pinExpiresAt: moment('2008-06-10T01:00:00.260'),
  pupil_uuid: '38f9b857-5a45-4b26-a3a7-0f126b08caaf',
  school_name: 'Example School One',
  school_uuid: '38ff3312-647e-43ed-84e4-df08927ae63c',
  checkForm_formData: JSON.stringify(questions)
}
