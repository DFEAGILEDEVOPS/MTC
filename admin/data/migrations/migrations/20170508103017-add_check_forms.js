'use strict';

module.exports = {

  up(db, next) {
    let objs = [];

    objs.push({
      _id: 100,
      name: 'MTC0100',
      createdAt: Date.now,
      updatedAt: Date.now,
      isDeleted: false,
      questions: [
        {f1: 2, f2: 5},
        {f1: 11, f2: 2},
        {f1: 8, f2: 9},
        {f1: 7, f2: 7},
        {f1: 3, f2: 9},
        {f1: 2, f2: 4},
        {f1: 3, f2: 3},
        {f1: 4, f2: 9},
        {f1: 6, f2: 5},
        {f1: 5, f2: 8},
        {f1: 3, f2: 7},
        {f1: 8, f2: 4},
        {f1: 6, f2: 7},
        {f1: 7, f2: 4},
        {f1: 3, f2: 2},
        {f1: 6, f2: 6},
        {f1: 7, f2: 11},
        {f1: 12, f2: 5},
        {f1: 10, f2: 5},
        {f1: 12, f2: 12}
      ]
    });

    objs.push({
      _id: 101,
      name: 'MTC0101',
      createdAt: Date.now,
      updatedAt: Date.now,
      isDeleted: false,
      questions: [
        {f1: 2, f2: 5},
        {f1: 11, f2: 2},
        {f1: 8, f2: 9},
        {f1: 7, f2: 7},
        {f1: 3, f2: 9},
        {f1: 2, f2: 4},
        {f1: 3, f2: 3},
        {f1: 4, f2: 9},
        {f1: 6, f2: 5},
        {f1: 5, f2: 8},
        {f1: 3, f2: 7},
        {f1: 8, f2: 4},
        {f1: 6, f2: 7},
        {f1: 7, f2: 4},
        {f1: 3, f2: 2},
        {f1: 6, f2: 6},
        {f1: 7, f2: 11},
        {f1: 12, f2: 5},
        {f1: 10, f2: 5},
        {f1: 12, f2: 12}
      ]
    });

    objs.push({
      _id: 102,
      name: 'MTC0102',
      createdAt: Date.now,
      updatedAt: Date.now,
      isDeleted: false,
      questions: [
        {f1: 2, f2: 5},
        {f1: 11, f2: 2},
        {f1: 8, f2: 9},
        {f1: 7, f2: 7},
        {f1: 3, f2: 9},
        {f1: 2, f2: 4},
        {f1: 3, f2: 3},
        {f1: 4, f2: 9},
        {f1: 6, f2: 5},
        {f1: 5, f2: 8},
        {f1: 3, f2: 7},
        {f1: 8, f2: 4},
        {f1: 6, f2: 7},
        {f1: 7, f2: 4},
        {f1: 3, f2: 2},
        {f1: 6, f2: 6},
        {f1: 7, f2: 11},
        {f1: 12, f2: 5},
        {f1: 10, f2: 5},
        {f1: 12, f2: 12}
      ]
    });

    db.collection('checkforms').insertMany(objs, function(error) {
      if (error) {
        console.log(error);
        next(error);
      }
    });

    next();
  },

  down(db, next) {
    db.collection('checkforms').drop(error => {
      if (error) next(error);
      next();
    });
  }

};
