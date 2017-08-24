'use strict'
const Promise = require('bluebird')
const crypto = Promise.promisifyAll(require('crypto'))
const jwt = require('jsonwebtoken')
const uuidv4 = require('uuid/v4')

/** @namespace */

const jwtService = {
  /**
   *
   * @param pupil
   * @return {*}
   */
  createToken: async (pupil) => {
    if (!(pupil && pupil._id)) {
      throw new Error('Pupil is required')
    }
    const jwtId = uuidv4()
    pupil.jwtSecret = await crypto.randomBytes(32).toString('hex')
    await pupil.save()

    // TODO: for additional security add in a device Id
    const payload = {
      iss: 'MTC Admin',                                       // Issuer
      sub: pupil._id,                                         // Subject
      exp: Math.floor(Date.now() / 1000) + (60 * 60),         // Expiry
      nbf: Math.floor(Date.now() / 1000),                     // Not before
      jwi: jwtId                                              // JWT token ID
    }

    // Construct a JWT token
    const token = jwt.sign(payload, pupil.jwtSecret)
    return token
  },
  /**
   * Authenticate a token
   * @param token
   * @return {boolean}
   */
  verify: (token) => {
    // if (!token) {
    //   throw new Error('Token is required')
    // }
    return false
  }
}

module.exports = jwtService
