'use strict'

module.exports = {

  up (db, next) {
    // This removes the following fields from Pupil documents, to correspond to the changes in the model:
    //   warmUpStartDate,   warmUpEndDate,   checkStartDate,   checkEndDate
    db.collection('pupils').update({}, {
      $unset: {
        warmUpStartDate: '',
        warmUpEndDate: '',
        checkStartDate: '',
        checkEndDate: ''
      }
    })
    next()
  },

  down (db, next) {
    // to revert this restore from backup
    next()
  }
}
