'use strict'
const ncaToolsAuthService = require('../lib/nca-tools-auth-service')
const userDataService = require('../services/data-access/user.data.service')
const adminLogonEventDataService = require('../services/data-access/admin-logon-event.data.service')
const roleService = require('../services/role.service')
const config = require('../config')

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
  const logonEvent = {
    sessionId: req.session.id,
    body: JSON.stringify(req.body),
    remoteIp: (req.headers['x-forwarded-for'] || req.connection.remoteAddress),
    userAgent: req.headers['user-agent'],
    loginMethod: 'nca-tools'
  }

  try {
    const senderPublicKey = config.TSO_AUTH_PUBLIC_KEY
    const recipientPrivateKey = config.MTC_AUTH_PRIVATE_KEY
    const userData = await ncaToolsAuthService(encKey, encIv, encData, encSignature, senderPublicKey, recipientPrivateKey)

    let userRecord = await userDataService.sqlFindOneByIdentifier(userData.UserName)
    if (!userRecord) {
      const mtcRoleName = roleService.mapNcaRoleToMtcRole(userData.UserType)
      const role = await roleService.findByName(mtcRoleName)
      const roleId = role.id
      const user = {
        identifier: userData.UserName,
        school_id: userData.school,
        role_id: roleId
      }
      await userDataService.sqlCreate(user)
      userRecord = await userDataService.sqlFindOneByIdentifier(userData.UserName)
      if (!userRecord) {
        throw new Error('unable to create user record')
      }
    }

    // auth success
    logonEvent.user_id = userRecord.id
    logonEvent.isAuthenticated = true
    logonEvent.ncaUserName = userData.UserName
    logonEvent.ncaSessionToken = userData.SessionToken

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
