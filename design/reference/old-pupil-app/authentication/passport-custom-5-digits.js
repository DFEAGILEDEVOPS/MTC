'use strict'
const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const School = require('../models/school')
const Pupil = require('../models/pupil')
const LogonEvent = require('../models/logon-event')

// Form fields from the HTML
const fieldSchoolPin = 'school-pin'
const fieldPupilPin = 'pupil-pin'

module.exports = async function (req, done) {
  try {
    const schoolPin = req.body[fieldSchoolPin]
    const pupilPin = req.body[fieldPupilPin]

    // Setup the logonEvent
    let logonEvent = new LogonEvent()
    logonEvent.sessionId = req.session.id
    logonEvent.schoolPin = req.body[fieldSchoolPin]
    logonEvent.pupilPin = req.body[fieldPupilPin]

    // You can't log in without *both* pins
    if (!(schoolPin && pupilPin)) {
      await saveFailedLogin(logonEvent, req, null, null)
      return done(null, false)
    }

    const school = await School.findOne({schoolPin}).exec()

    if (!school) {
      // school not found
      await saveFailedLogin(logonEvent, req, school, null)
      return done(null, false)
    }

    const pupil = await Pupil.findOne({
      school: school._id,
      pin: pupilPin,
      pinExpired: false
    }).exec()

    if (!pupil) {
      await saveFailedLogin(logonEvent, req, school, pupil)
      return done(null, false)
    }

    // Authenticated
    await saveSuccessfulLogin(logonEvent, school, pupil)
    req.session.logonEvent = logonEvent.toJSON()
    return done(null, pupil)
  } catch (error) {
    console.error('Error during authentication: ', error)
    return done(error)
  }
}

function validationErrors (req, sp, pp) {
  let errorMsgs = []

  if (!req.body[fieldSchoolPin]) {
    errorMsgs.push('School PIN missing')
  }
  if (!req.body[fieldPupilPin]) {
    errorMsgs.push('Pupil PIN missing')
  }
  if (req.body[fieldSchoolPin] && sp === null) {
    errorMsgs.push('Invalid school PIN (not in list)')
  }
  if (req.body[fieldPupilPin] && pp === null) {
    errorMsgs.push('Invalid Pupil PIN (not in list)')
  }

  return errorMsgs
}

async function saveFailedLogin (logonEvent, req, school, pupil) {
  logonEvent.errorMsg = validationErrors(req, school, pupil)
  logonEvent.isAuthenticated = false
  if (school && school._id) {
    logonEvent.school = school._id
  }
  if (pupil && pupil._id) {
    logonEvent.pupil = pupil._id
  }
  await logonEvent.save()
  return logonEvent
}

async function saveSuccessfulLogin (logonEvent, school, pupil) {
  logonEvent.isAuthenticated = true
  if (school && school._id) {
    logonEvent.school = school._id
  }
  if (pupil && pupil._id) {
    logonEvent.pupil = pupil._id
  }
  await logonEvent.save()
  return logonEvent
}
