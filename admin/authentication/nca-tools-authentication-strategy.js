'use strict'
const ncaToolsAuthService = require('../lib/nca-tools-auth-service')
const AdminLogonEvent = require('../models/admin-logon-event')

module.exports = async function (req, done) {
  // Post fields from NCA Tools, all fields are Base64 encoded.

  /**
   * Symmetric key that used to encrypt `encData` .  It is itself encrypted with out RSA public key
   */
  const encKey = req.body.MessagePart1

  /**
   * Initialisation Vector used when encrypting the `encData`.  It is itself encrypted with out RSA public key.
   */
  const encIv = req.body.MessagePart2

  /**
   * Data packet from NCA Tools.  It is encrypted with aes-256-cbc
   */
  const encData = req.body.MessagePart3

  /**
   * RSA signature hash created from the remote private key.  Can be verified with their public which we have.
   */
  const encSignature = req.body.MessagePart4

  /**
   * Store the logon attempt
   */
  const logonEvent = new AdminLogonEvent({
    sessionId: req.session.id,
    body: JSON.stringify(req.body),
    remoteIp: (req.headers['x-forwarded-for'] || req.connection.remoteAddress),
    userAgent: req.headers['user-agent'],
    loginMethod: 'nca-tools'
  })

  try {
    const userData = await ncaToolsAuthService(encKey, encIv, encData, encSignature)

    // auth success
    logonEvent.isAuthenticated = true
    logonEvent.ncaEmailAddress = userData.EmailAddress
    logonEvent.ncaUserType = userData.UserType
    logonEvent.ncaUserName = userData.UserName
    logonEvent.ncaSessionToken = userData.SessionToken
    logonEvent.school = userData.School
    logonEvent.role = userData.role
    await logonEvent.save()

    return done(null, userData)
  } catch (error) {
    // auth failed
    logonEvent.isAuthenticated = false
    logonEvent.errorMsg = error.message
    try {
      await logonEvent.save()
    } catch (error) {
      console.error('Failed to save Logon Event: ' + error.message)
    }
    console.error('Authentication error: ', error)
    return done(null, false)
  }
}
