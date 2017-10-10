const moment = require('moment')

module.exports = [
  {
    _id: '595cd5416e5ca13e48ed2518',
    school: 9991001,
    foreName: 'Pupil',
    lastName: 'One',
    pin: 'd55sg',
    attendanceCode: {
      byUserEmail: 'teacher1',
      byUserName: 'teacher1',
      dateRecorded: moment('2017-10-09 15:24:05').toDate(),
      _id: '59c39fe72186e6748a58bbc7'
    }
  },
  {
    _id: '595cd5416e5cv88e48ed2512',
    school: 9991001,
    foreName: 'Pupil',
    lastName: 'Two',
    pin: 's34sy',
    attendanceCode: {
      byUserEmail: 'teacher2',
      byUserName: 'teacher2',
      dateRecorded: moment('2017-10-09 15:28:15').toDate(),
      _id: '59c39fe72186e6748a58bbc6'
    }
  },
  {
    _id: '595cd5416e5cv88e69ed2632',
    school: 9991001,
    foreName: 'Pupil',
    lastName: 'Three',
    pin: '437bu',
    attendanceCode: {
      byUserEmail: 'teacher2',
      byUserName: 'teacher2',
      dateRecorded: moment('2017-10-09 15:29:55').toDate(),
      _id: '59c39fe72186e6748a58bbc4'
    }
  }
]
