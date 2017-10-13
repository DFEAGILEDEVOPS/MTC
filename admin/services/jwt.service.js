'use strict'
const Promise = require('bluebird')
const crypto = Promise.promisifyAll(require('crypto'))
const jwt = Promise.promisifyAll(require('jsonwebtoken'))
const uuidv4 = require('uuid/v4')
const ObjectId = require('mongoose').Types.ObjectId

const pupilDataService = require('./data-access/pupil.data.service')

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
    const jwtSecret = await crypto.randomBytes(32).toString('hex')
    await pupilDataService.update(pupil._id, {jwtSecret: jwtSecret})

    // TODO: for additional security add in a device Id
    const payload = {
      iss: 'MTC Admin',                                       // Issuer
      sub: pupil._id,                                         // Subject
      exp: Math.floor(Date.now() / 1000) + (60 * 60),         // Expiry
      nbf: Math.floor(Date.now() / 1000),                     // Not before
      jwi: jwtId                                              // JWT token ID
    }

    // Construct a JWT token
    const token = await jwt.sign(payload, jwtSecret)
    return {token, jwtSecret}
  },
  /**
   * Verify a token
   * @param {String} token
   * @return {boolean}
   */
  verify: async (token) => {
    if (!token) {
      throw new Error('Token is required')
    }

    // This does not verify the signature is valid
    const decoded = jwt.decode(token)

    // Find the pupil in the subject to retrieve the secret
    const pupil = await pupilDataService.findOne({_id: ObjectId(decoded.sub)})

    if (!pupil) {
      throw new Error('Subject not found')
    }

    if (!pupil.jwtSecret) {
      throw new Error('Error - missing secret')
    }

    try {
      await jwt.verify(token, pupil.jwtSecret)
    } catch (error) {
      throw new Error('Unable to verify: ' + error.message)
    }

    return true
  }
}

module.exports = jwtService
