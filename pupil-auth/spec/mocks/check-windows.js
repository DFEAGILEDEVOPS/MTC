const moment = require('moment')

module.exports = [
  {
    id: 1,
    checkEndDate: moment('2018-01-20 00:00:00'),
    checkStartDate: moment('2018-01-10 00:00:00'),
    adminStartDate: moment('2017-10-18 00:00:00'),
    name: 'Test window 3',
    formCount: 2,
    isDeleted: false
  },
  {
    id: 2,
    checkEndDate: moment('2017-11-28 00:00:00'),
    checkStartDate: moment('2017-10-25 00:00:00'),
    adminStartDate: moment('2017-10-19 00:00:00'),
    name: 'Window Test 1',
    formCount: 1,
    isDeleted: false
  },
  {
    id: 3,
    checkEndDate: moment('2017-10-28 00:00:00'),
    checkStartDate: moment('2017-10-15 00:00:00'),
    adminStartDate: moment('2017-10-19 00:00:00'),
    name: 'Window Test 2',
    formCount: 0,
    isDeleted: true
  }
]
