const moment = require('moment')

module.exports = [
  {
    _id: '595cd5416e5ca13e48ed2518',
    updatedAt: moment('2017-10-10 11:43:49').toDate(),
    createdAt: moment('2017-09-30 23:37:17').toDate(),
    school: 9991001,
    upn: 'F935322311201',
    foreName: 'John',
    lastName: 'Smith',
    middleNames: 'Aaron',
    gender: 'M',
    dob: moment('1987-02-18 00:00:00').toDate(),
    pin: 'd55sg',
    hasAttended: false,
    pinExpired: false,
    __v: 0,
    attendanceCode: {
      byUserEmail: 'teacher1',
      byUserName: 'teacher1',
      dateRecorded: moment('2017-10-09 15:24:05').toDate(),
      _id: '59df7e1c283960b43172ac6b'
    },
    reason: 'Incorrect registration'
  },
  {
    _id: '59d02aad9b865f35a3f5176b',
    updatedAt: moment('2017-10-10 11:43:49').toDate(),
    createdAt: moment('2017-09-30 23:37:17').toDate(),
    school: 9991001,
    upn: 'X765812302245',
    foreName: 'Tom',
    lastName: 'Miller',
    middleNames: 'Richard',
    gender: 'M',
    dob: moment('1987-03-13 00:00:00').toDate(),
    pin: '437bu',
    hasAttended: false,
    pinExpired: false,
    __v: 0,
    attendanceCode: {
      byUserEmail: 'teacher2',
      byUserName: 'teacher2',
      dateRecorded: moment('2017-10-09 15:29:55').toDate(),
      _id: '59df7e1c283960b43172ac6c'
    },
    reason: 'Absent'
  },
  {
    _id: '595cd5416e5cv88e48ed2512',
    updatedAt: moment('2017-10-10 11:43:49').toDate(),
    createdAt: moment('2017-09-30 23:37:17').toDate(),
    school: 9991001,
    upn: 'X765093405836',
    foreName: 'Sarah',
    lastName: 'Connor',
    middleNames: '',
    gender: 'F',
    dob: moment('1987-04-20 00:00:00').toDate(),
    pin: 's34sy',
    hasAttended: false,
    pinExpired: false,
    __v: 0,
    attendanceCode: {
      byUserEmail: 'teacher2',
      byUserName: 'teacher2',
      dateRecorded: moment('2017-10-09 15:28:15').toDate(),
      _id: '59df7e1c283960b43172ac6d'
    },
    reason: 'Left school'
  },
  {
    _id: '595cd5416e5cv88e48edc451',
    updatedAt: moment('2017-10-10 11:43:49').toDate(),
    createdAt: moment('2017-09-30 23:37:17').toDate(),
    school: 9991001,
    upn: 'M789090205681',
    foreName: 'Bronislaw',
    lastName: 'Malinowsky',
    middleNames: '',
    gender: 'F',
    dob: moment('1987-04-20 00:00:00').toDate(),
    pin: 't78sq',
    hasAttended: false,
    pinExpired: false,
    __v: 0,
    reason: '-'
  }
]
