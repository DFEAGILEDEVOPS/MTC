'use strict'

module.exports = {

  up (db, next) {
    // As this branch has removed pupilfeedbacks.sessionId and added pupilfeedbacks.checkId there is no way to backfill the
    // existing data.  Therefore as we are not live, this migration removes the old test data.
    db.collection('pupilfeedbacks').remove({}, false)
    next()
  },

  down (db, next) {
    // The data is gone. If you want it back, fetch a backup.
    next()
  }
}
