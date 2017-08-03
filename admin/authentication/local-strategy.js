'use strict'

const bcrypt = require('bcryptjs')
const User = require('../models/user')
const AdminLogonEvent = require('../models/admin-logon-event')

module.exports = function (req, email, password, done) {
  /**
   * Store the logon attempt
   */
  const logonEvent = new AdminLogonEvent({
    sessionId: req.session.id,
    body: '<Not Logged>', // Don't store username and password combo in plaintext - no logging on this strategy
    remoteIp: (req.headers['x-forwarded-for'] || req.connection.remoteAddress),
    userAgent: req.headers['user-agent'],
    loginMethod: 'local'
  })

  User.findOne({email}, async function (err, user) {
    try {
      if (err) {
        await saveInvalidLogonEvent(logonEvent, err.message)
        return done(err)
      }
      if (!user) {
        await saveInvalidLogonEvent(logonEvent, 'Invalid user')
        return done(null, false) // failure - wrong email
      }
    } catch (error) {
      console.error(error)
    }

    bcrypt.compare(password, user.passwordHash, async function (err, res) {
      try {
        if (err) {
          await saveInvalidLogonEvent(logonEvent, err.message)
          return done(err)
        }
        if (res === true) {
          // Success - but we should mock the expected session object coming in from NCA Tools
          const mock = {
            EmailAddress: email,
            UserName: email,
            UserType: 'SchoolNom',
            School: user.school,
            role: user.role,
            logonAt: Date.now()
          }
          await saveValidLogonEvent(logonEvent, mock)
          return done(null, mock)
        } else {
          await saveInvalidLogonEvent(logonEvent, 'Invalid password')
          return done(null, false)
        }
      } catch (error) {
        console.error(error)
        return done(error)
      }
    })
  })
}

async function saveInvalidLogonEvent (logonEvent, message) {
  try {
    logonEvent.errorMsg = message
    logonEvent.isAuthenticated = false
    await logonEvent.save()
  } catch (error) {
    console.log('Failed to save logon event: ' + error.message)
  }
}

async function saveValidLogonEvent (logonEvent, session) {
  try {
    logonEvent.isAuthenticated = true
    logonEvent.ncaEmailAddress = session.EmailAddress
    logonEvent.ncaUserType = session.UserType
    logonEvent.ncaUserName = session.UserName
    logonEvent.ncaSessionToken = session.SessionToken
    logonEvent.school = session.School
    logonEvent.role = session.role
    logonEvent.save()
  } catch (error) {
    console.log('Failed to save logon event: ' + error.message)
  }
}
