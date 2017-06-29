'use strict';

const moment = require('moment');

module.exports = {

  up(db, next) {

    const objs = [];

    objs.push({
      name: 'Summer 2017',
      startDate: moment('2017-06-14 09:00:00').toDate(),
      endDate: moment('2017-06-30 23:59:59').toDate(),
      registrationStartDate: moment('2017-06-01 00:00:01').toDate(),
      registrationEndDate: moment('2017-06-13 23:59:59').toDate(),
      createdAt: Date.now,
      updatedAt: Date.now
    });

    objs.push({
      name: 'Spring 2017',
      startDate: moment('2017-05-05 09:00:00').toDate(),
      endDate: moment('2017-05-31 23:59:59').toDate(),
      registrationStartDate: moment('2017-05-01 00:00:01').toDate(),
      registrationEndDate: moment('2017-05-31 23:59:59').toDate(),
      createdAt: Date.now,
      updatedAt: Date.now
    });

    objs.push({
      name: 'Summer 2018',
      startDate: moment('2018-06-14 09:00:00').toDate(),
      endDate: moment('2018-06-30 23:59:59').toDate(),
      registrationStartDate: moment('2018-06-01 00:00:01').toDate(),
      registrationEndDate: moment('2018-06-13 23:59:59').toDate(),
      createdAt: Date.now,
      updatedAt: Date.now
    });

    objs.push({
      name: 'Winter 2018',
      startDate: moment('2018-11-21 09:00:00').toDate(),
      endDate: moment('2018-12-10 23:59:59').toDate(),
      registrationStartDate: moment('2018-11-01 00:00:01').toDate(),
      registrationEndDate: moment('2018-12-10 23:59:59').toDate(),
      createdAt: Date.now,
      updatedAt: Date.now
    });

    db.collection('checkwindows').insertMany(objs, function(error) {
      if (error) {
        console.log(error);
        next(error);
      }
    });
    next();
  },

  down(db, next) {
    db.collection('checkwindows').drop();
    next();
  }

};
