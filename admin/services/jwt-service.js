'use strict'
const Promise = require('bluebird')
const crypto = Promise.promisifyAll(require('crypto'))
const jwt = Promise.promisifyAll(require('jsonwebtoken'))
const uuidv4 = require('uuid/v4')
const ObjectId = require('mongoose').Types.ObjectId

const Pupil = require('../models/pupil')

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
    const token = await jwt.sign(payload, pupil.jwtSecret)
    return token
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
    const pupil = await Pupil.findOne(ObjectId(decoded.sub)).lean().exec()

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
