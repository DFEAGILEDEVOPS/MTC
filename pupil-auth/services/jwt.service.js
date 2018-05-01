'use strict'
const Promise = require('bluebird')
const moment = require('moment')
const jwt = Promise.promisifyAll(require('jsonwebtoken'))
const uuidv4 = require('uuid/v4')

const pupilDataService = require('./data-access/pupil.data.service')
const config = require('../config')

/** @namespace */

const jwtService = {
  /**
   *
   * @param {Object} pupil
   * @param {Moment} checkWindowEndDate
   * @return {*}
   */
  createToken: async (pupil, checkWindowEndDate) => {
    if (!(pupil && pupil.id)) {
      throw new Error('Pupil is required')
    }
    if (!checkWindowEndDate) {
      throw new Error('Check window end date is required')
    }
    const jwtId = uuidv4()
    const jwtSecret = config.JwtSecret
    await pupilDataService.sqlUpdate({id: pupil.id, token: jwtSecret})
    // TODO: for additional security add in a device Id
    const payload = {
      iss: 'MTC Admin',                                       // Issuer
      sub: pupil.id,                                         // Subject
      exp: moment(checkWindowEndDate).unix(),                // Expiry
      nbf: Math.floor(Date.now() / 1000),                     // Not before
      jwi: jwtId                                              // JWT token ID
    }

    // Construct a JWT token
    const token = await jwt.sign(payload, jwtSecret)
    return {token, jwtSecret}
  },
  /**
   * Decodes a token
   * @param {String} token
   * @return {Object}
   */
  decode: (token) => jwt.decode(token)
}

module.exports = jwtService
