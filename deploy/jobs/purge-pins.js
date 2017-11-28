'use strict'

try {
  print('erasing pupil pins...')
  db.pupils.updateMany(
    { pin: {$ne: null} },
    { $set: { pin: null, pinExpiresAt: null } }
  )
 printjson(db.runCommand('getlasterror'))
 print('erasing school pins...')
  db.schools.updateMany(
    { schoolPin: {$ne: null} },
    { $set: { schoolPin: null, pinExpiresAt: null } }
  )
  printjson(db.runCommand('getlasterror'))

} catch (e) {
  print(e)
}
