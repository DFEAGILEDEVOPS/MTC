'use strict'

const config = require('./../config')
const logger = require('./log.service').getLogger()
const roleService = require('./role.service')
const schoolDataService = require('./data-access/school.data.service')
const userDataService = require('./data-access/user.data.service')
const roles = require('../lib/consts/roles')
const dfeSigninDataService = require('./data-access/dfe-signin.data.service')

const service = {
  /**
   * @description maps an authenticated NCA Tools user to an MTC user, school and role
   * @param {object} dfeUser all decrypted user information sent in the request payload
   */
  initialiseUser: async (dfeUser, tokenset) => {
    if (!dfeUser) {
      throw new Error('dfeUser argument required')
    }
    if (!tokenset) {
      throw new Error('tokenset argument required')
    }
    // set up basic user properties
    dfeUser.id = dfeUser.sub
    // dfeUser.name = dfeUser.sub
    dfeUser.displayName = `${dfeUser.given_name} ${dfeUser.family_name} (${dfeUser.email})`
    dfeUser.id_token = tokenset.id_token

    const dfeRole = await dfeSigninDataService.getDfeRole(dfeUser)
    const mtcRoleTitle = roleService.mapDfeRoleToMtcRole(dfeRole)
    dfeUser.role = mtcRoleTitle
    const roleRecord = await roleService.findByTitle(mtcRoleTitle)

    let schoolRecord
    // lookup school if in teacher or headteacher role
    if (dfeUser.role === roles.teacher || dfeUser.role === roles.headTeacher) {
      if (dfeUser.organisation && dfeUser.organisation.urn) {
        logger.debug(`looking up school by URN:${dfeUser.organisation.urn}`)
        schoolRecord = await schoolDataService.sqlFindOneByUrn(dfeUser.organisation.urn)
        if (!schoolRecord) {
          // should we throw? as user in teacher role cannot continue without school...
          logger.warn(`school not found with URN:${dfeUser.organisation.urn}`)
        }
      } else {
        throw new Error('user.organisation or user.organisation.urn not found on dfeUser object')
      }
    }

    // set school specifics
    if (schoolRecord) {
      dfeUser.timezone = schoolRecord.timezone || config.DEFAULT_TIMEZONE
      dfeUser.School = schoolRecord.dfeNumber
      dfeUser.schoolId = schoolRecord.id
    }

    // lookup user record
    let userRecord = await userDataService.sqlFindOneByIdentifier(dfeUser.id)
    if (!userRecord) {
      // create user record, as this is their first visit to MTC
      const user = {
        identifier: dfeUser.id,
        displayName: dfeUser.displayName,
        role_id: roleRecord.id
      }
      if (schoolRecord) {
        user.school_id = schoolRecord.id
      }
      await userDataService.sqlCreate(user)
      userRecord = await userDataService.sqlFindOneByIdentifier(dfeUser.id)
      if (!userRecord) {
        throw new Error('unable to find user record')
      }
    } else {
      // user exists - check requested school
      if (schoolRecord && (userRecord.school_id !== schoolRecord.id)) {
        await userDataService.sqlUpdateSchool(userRecord.id, schoolRecord.id)
        userRecord = await userDataService.sqlFindOneByIdentifier(dfeUser.id)
      }
    }
    // set id to sql record id
    dfeUser.id = userRecord.id
    dfeUser.school_id = userRecord.school_id
    // userRecord.mtcRole = roleService.mapNcaRoleToMtcRole(dfeUser.UserType, urn)
    // return userRecord
    logger.debug('user initialised...')
    logger.debugObject(dfeUser)
    return dfeUser
  }
}

module.exports = service
