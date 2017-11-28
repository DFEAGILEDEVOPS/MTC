'use strict'

try {
  db.pupils.updateMany(
    { pin: {$ne: null} },
    { $set: { pin: null, pinExpiresAt: null } }
  )
  db.runCommand('getlasterror')
  db.schools.updateMany(
    { schoolPin: {$ne: null} },
    { $set: { schoolPin: null, pinExpiresAt: null } }
  )
  print(db.runCommand('getlasterror'))

} catch (e) {
  print(e)
}
