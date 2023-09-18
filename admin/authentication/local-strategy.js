'use strict'

const bcrypt = require('bcryptjs')
const R = require('ramda')
const logger = require('../services/log.service').getLogger()

const userDataService = require('../services/data-access/user.data.service')
const adminLogonEventDataService = require('../services/data-access/admin-logon-event.data.service')
const { isNumber, isNotNil, isInteger } = require('ramda-adjunct')

module.exports = async function (req, userIdentifier, password, done) {
  /**
   * Store the logon attempt
   */
  const logonEvent = {
    sessionId: req.session.id,
    body: JSON.stringify(R.omit(['password'], R.prop('body', req))),
    remoteIp: req.headers['x-forwarded-for'] || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    loginMethod: 'local',
    school_id: null
  }

  try {
    const user = await userDataService.sqlFindUserInfoByIdentifier(userIdentifier)
    if (!user || !user.identifier || !user.roleName) {
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
      EmailAddress: userIdentifier,
      displayName: userIdentifier,
      UserName: userIdentifier,
      UserType: 'SchoolNom',
      School: user.dfeNumber,
      SchoolName: user.schoolName, // added so that we can display the school impersonation details for helpdesk and staAdmin roles
      schoolId: user.schoolId,
      timezone: user.timezone,
      role: user.roleName,
      logonAt: Date.now(),
      id: user.id
    }

    if (isNotNil(user.schoolId) && isNumber(user.schoolId) && isInteger(user.schoolId)) {
      logonEvent.school_id = user.schoolId
    }

    // Success - valid login
    logonEvent.user_id = user.id
    await saveValidLogonEvent(logonEvent, sessionData)
    return done(null, sessionData)
  } catch (error) {
    logger.warn(error)
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
    logger.warn('Failed to save invalid logon event: ' + error.message)
  }
}

async function saveValidLogonEvent (logonEvent, session) {
  try {
    logonEvent.isAuthenticated = true
    await adminLogonEventDataService.sqlCreate(logonEvent)
  } catch (error) {
    logger.warn('Failed to save valid logon event: ' + error.message)
  }
}
