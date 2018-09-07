const moment = require('moment')

module.exports = [
  {
    id: 1,
    checkEndDate: moment('2018-01-20T00:00:00'),
    checkStartDate: moment('2018-01-10T00:00:00'),
    adminStartDate: moment('2017-10-18T00:00:00'),
    name: 'Test window 3',
    formCount: 2,
    isDeleted: false
  },
  {
    id: 2,
    checkEndDate: moment('2017-11-28T00:00:00'),
    checkStartDate: moment('2017-10-25T00:00:00'),
    adminStartDate: moment('2017-10-19T00:00:00'),
    name: 'Window Test 1',
    formCount: 1,
    isDeleted: false
  },
  {
    id: 3,
    checkEndDate: moment('2017-10-28T00:00:00'),
    checkStartDate: moment('2017-10-15T00:00:00'),
    adminStartDate: moment('2017-10-19T00:00:00'),
    name: 'Window Test 2',
    formCount: 0,
    isDeleted: true
  }
]
