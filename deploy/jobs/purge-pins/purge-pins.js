'use strict'

try {
  db.pupils.updateMany(
     { pin: {$ne: null} },
     { $set: { pin: null, pinExpiresAt: null } }
  );
  db.schools.updateMany(
    { schoolPin: {$ne: null} },
    { $set: { schoolPin: null, pinExpiresAt: null } }
 );
} catch (e) {
  print(e);
}