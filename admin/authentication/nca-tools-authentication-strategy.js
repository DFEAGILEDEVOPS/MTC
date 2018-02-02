'use strict'
const ncaToolsAuthService = require('../services/nca-tools-auth.service')
const adminLogonEventDataService = require('../services/data-access/admin-logon-event.data.service')
const config = require('../config')
const ncaToolsUserService = require('../services/nca-tools-user.service')

module.exports = async function (req, done) {
  // Post fields from NCA Tools, all fields are Base64 encoded.

  // Symmetric key that used to encrypt `encData` .  It is itself encrypted with out RSA public key
  const encKey = req.body.MessagePart1
  // Initialisation Vector used when encrypting the `encData`.  It is itself encrypted with out RSA public key.
  const encIv = req.body.MessagePart2
  // Data packet from NCA Tools.  It is encrypted with aes-256-cbc
  const encData = req.body.MessagePart3
  // RSA signature hash created from the remote private key.  Can be verified with their public which we have.
  const encSignature = req.body.MessagePart4

  const logonEvent = {
    sessionId: req.session.id,
    body: JSON.stringify(req.body),
    remoteIp: (req.headers['x-forwarded-for'] || req.connection.remoteAddress),
    userAgent: req.headers['user-agent'],
    loginMethod: 'nca-tools'
  }

  try {
    const ncaPublicKey = config.TSO_AUTH_PUBLIC_KEY
    const mtcPrivateKey = config.MTC_AUTH_PRIVATE_KEY
    const userData = await ncaToolsAuthService.authenticate(encKey, encIv, encData, encSignature, ncaPublicKey, mtcPrivateKey)

    try {
      if (userData.School) {
        userData.School = parseInt(userData.School, 10)
      }
      await ncaToolsUserService.recordLogonAttempt({
        sessionToken: userData.SessionToken,
        userName: userData.UserName,
        userType: userData.UserType,
        emailAddress: userData.EmailAddress,
        dfeSchoolNumber: userData.School
      })
    } catch (error) {
      throw new Error('Failed to save NCA Tools Session Data - possible replay attack: ' + error.message)
    }
    const mtcUser = await ncaToolsUserService.mapNcaUserToMtcUser(userData)
    userData.role = mtcUser.mtcRole
    // auth success
    logonEvent.user_id = mtcUser.id
    logonEvent.isAuthenticated = true
    logonEvent.authProviderSessionToken = mtcUser.SessionToken
    await adminLogonEventDataService.sqlCreate(logonEvent)

    return done(null, userData)
  } catch (error) {
    // auth failed
    logonEvent.isAuthenticated = false
    logonEvent.errorMsg = error.message
    try {
      await adminLogonEventDataService.sqlCreate(logonEvent)
    } catch (error) {
      console.error('Failed to save Logon Event: ' + error.message)
    }
    console.error('Authentication error: ', error)
    return done(null, false)
  }
}
