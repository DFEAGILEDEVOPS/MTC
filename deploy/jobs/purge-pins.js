'use strict'

try {
  print('erasing pupil pins...')
  printjson(db.pupils.updateMany(
    { pin: {$ne: null} },
    { $set: { pin: null, pinExpiresAt: null } }
  ))

  print('erasing school pins...')
  printjson(db.schools.updateMany(
    { schoolPin: {$ne: null} },
    { $set: { schoolPin: null, pinExpiresAt: null } }
  ))
} catch (e) {
  print('ERROR...')
  print(e)
  throw e
}
