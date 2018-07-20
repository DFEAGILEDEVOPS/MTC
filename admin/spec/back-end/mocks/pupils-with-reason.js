const moment = require('moment')

module.exports = [
  {
    _id: '595cd5416e5ca13e48ed2518',
    school: 9991001,
    foreName: 'John',
    lastName: 'Smith',
    pin: 'd55sg',
    attendanceCode: {
      byUserEmail: 'teacher1',
      byUserName: 'teacher1',
      dateRecorded: moment('2017-10-09 15:24:05').toDate(),
      _id: '59df7e1c283960b43172ac6b'
    }
  },
  {
    _id: '595cd5416e5cv88e69ed2632',
    school: 9991001,
    foreName: 'Tom',
    lastName: 'Miller',
    pin: '437bu',
    attendanceCode: {
      byUserEmail: 'teacher2',
      byUserName: 'teacher2',
      dateRecorded: moment('2017-10-09 15:29:55').toDate(),
      _id: '59df7e1c283960b43172ac6c'
    }
  },
  {
    _id: '595cd5416e5cv88e48ed2512',
    school: 9991001,
    foreName: 'Sarah',
    lastName: 'Connor',
    pin: 's34sy',
    attendanceCode: {
      byUserEmail: 'teacher2',
      byUserName: 'teacher2',
      dateRecorded: moment('2017-10-09 15:28:15').toDate(),
      _id: '59df7e1c283960b43172ac6d'
    }
  },
  {
    _id: '595cd5416e5cv88e48edc451',
    school: 9991001,
    foreName: 'Bronislaw',
    lastName: 'Malinowsky',
    pin: 'a67lp'
  }
]
