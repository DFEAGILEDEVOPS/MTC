'use strict'

const bcrypt = require('bcryptjs')
const R = require('ramda')
const winston = require('winston')

const userDataService = require('../services/data-access/user.data.service')
const schoolDataService = require('../services/data-access/school.data.service')
const roleDataService = require('../services/data-access/role.data.service')
const adminLogonEventDataService = require('../services/data-access/admin-logon-event.data.service')

module.exports = async function (req, email, password, done) {
  /**
   * Store the logon attempt
   */
  const logonEvent = {
    sessionId: req.session.id,
    body: JSON.stringify(R.omit(['password'], R.prop('body', req))),
    remoteIp: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    loginMethod: 'local'
  }

  try {
    const user = await userDataService.sqlFindOneByIdentifier(email)
    const schoolPromise = schoolDataService.sqlFindOneById(R.prop('school_id', user))
    const rolePromise = roleDataService.sqlFindOneById(R.prop('role_id', user))
    const [school, role] = await Promise.all([schoolPromise, rolePromise])

    if (!user || !role || !school) {
      // Invalid user
      await saveInvalidLogonEvent(logonEvent, 'Invalid user')
      return done(null, false)
    }

    const isEqual = await bcryptCompare(password, user.passwordHash)

    if (!isEqual) {
      // Invalid password
      await saveInvalidLogonEvent(logonEvent, 'Invalid password')
      return done(null, false)
    }

    const sessionData = {
      EmailAddress: email,
      UserName: email,
      UserType: 'SchoolNom',
      School: school.dfeNumber,
      role: role.title,
      logonAt: Date.now(),
      userId: user.id
    }

    // Success - valid login
    logonEvent.user_id = user.id
    req.session.userId = user.id
    await saveValidLogonEvent(logonEvent, sessionData)
    return done(null, sessionData)
  } catch (error) {
    winston.warn(error)
    await saveInvalidLogonEvent(logonEvent, 'Server error: ' + error.message)
    done(error)
  }
}

function bcryptCompare (plaintext, hash) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(plaintext, hash, function (err, res) {
      if (err) return reject(err)
      resolve(res)
    })
  })
}

async function saveInvalidLogonEvent (logonEvent, message) {
  try {
    logonEvent.errorMsg = message
    logonEvent.isAuthenticated = false
    await adminLogonEventDataService.sqlCreate(logonEvent)
  } catch (error) {
    winston.warn('Failed to save logon event: ' + error.message)
  }
}

async function saveValidLogonEvent (logonEvent, session) {
  try {
    logonEvent.isAuthenticated = true
    logonEvent.ncaEmailAddress = session.EmailAddress
    logonEvent.ncaUserName = session.UserName
    await adminLogonEventDataService.sqlCreate(logonEvent)
  } catch (error) {
    winston.warn('Failed to save logon event: ' + error.message)
  }
}
