'use strict'

module.exports = {

  up (db, next) {
    // Rename field checks.checkStartDate -> checks.pupilLoginDate
    db.collection('checks').update({}, {$rename: {checkStartDate: 'pupilLoginDate'}})
    next()
  },

  down (db, next) {
    // TODO write the statements to rollback your migration (if possible)
    db.collection('checks').update({}, {$rename: {pupilLoginDate: 'checkStartDate'}})
    next()
  }
}
