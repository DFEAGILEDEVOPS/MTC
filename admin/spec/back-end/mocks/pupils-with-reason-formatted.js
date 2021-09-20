const moment = require('moment')

module.exports = [
  {
    id: 1,
    updatedAt: moment('2017-10-10 11:43:49'),
    createdAt: moment('2017-09-30 23:37:17'),
    school_id: 1,
    upn: 'F935322311201',
    foreName: 'John',
    lastName: 'Smith',
    middleNames: 'Aaron',
    gender: 'M',
    dateOfBirth: moment('1987-02-18 00:00:00'),
    reason: 'Incorrect registration'
  },
  {
    id: 2,
    updatedAt: moment('2017-10-10 11:43:49'),
    createdAt: moment('2017-09-30 23:37:17'),
    school: 1,
    upn: 'X765812302245',
    foreName: 'Tom',
    lastName: 'Miller',
    middleNames: 'Richard',
    gender: 'M',
    dateOfBirth: moment('1987-03-13 00:00:00'),
    reason: 'Absent'
  },
  {
    id: 3,
    updatedAt: moment('2017-10-10 11:43:49'),
    createdAt: moment('2017-09-30 23:37:17'),
    school: 1,
    upn: 'X765093405836',
    foreName: 'Sarah',
    lastName: 'Connor',
    middleNames: '',
    gender: 'F',
    dateOfBirth: moment('1987-04-20 00:00:00'),
    reason: 'Left school'
  },
  {
    id: 4,
    updatedAt: moment('2017-10-10 11:43:49'),
    createdAt: moment('2017-09-30 23:37:17'),
    school: 1,
    upn: 'M789090205681',
    foreName: 'Bronislaw',
    lastName: 'Malinowsky',
    middleNames: '',
    gender: 'F',
    dateOfBirth: moment('1987-04-20 00:00:00'),
    reason: '-'
  }
]
