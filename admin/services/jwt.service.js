'use strict'
const Promise = require('bluebird')
const moment = require('moment')
const crypto = Promise.promisifyAll(require('crypto'))
const jwt = Promise.promisifyAll(require('jsonwebtoken'))
const uuidv4 = require('uuid/v4')
const config = require('../config')

const pupilDataService = require('./data-access/pupil.data.service')
const monitor = require('../helpers/monitor')

/** @namespace */

const jwtService = {
  /**
   *
   * @param {Object} pupil
   * @param {Moment} expiryDate
   * @return {*}
   */
  createToken: async (pupil, expiryDate) => {
    if (!(pupil && pupil.id)) {
      throw new Error('Pupil is required')
    }

    if (!expiryDate) {
      throw new Error('Expiry date is required')
    }

    if (!moment.isMoment(expiryDate) || !expiryDate.isValid()) {
      throw new Error('Invalid expiry date')
    }

    const jwtId = uuidv4()
    const jwtSecret = await crypto.randomBytes(32).toString('hex')

    // TODO: for additional security add in a device Id
    const payload = {
      iss: 'MTC Admin', // Issuer
      sub: pupil.id, // Subject
      exp: expiryDate.unix(), // Expiry
      nbf: Math.floor(Date.now() / 1000), // Not before
      jwi: jwtId // JWT token ID
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
    const decoded = jwtService.decode(token)

    // Find the pupil in the subject to retrieve the secret
    const pupil = await pupilDataService.sqlFindOneById(decoded.sub)

    if (!pupil) {
      throw new Error('Subject not found')
    }

    if (!pupil.jwtSecret) {
      throw new Error('Error - missing secret')
    }

    // Verify the token signature is valid, and signed by the secret key stored in the pupil table
    try {
      await jwt.verify(token, pupil.jwtSecret)
    } catch (error) {
      throw new Error('Unable to verify: ' + error.message)
    }

    return true
  },
  /**
   * Decodes a token
   * @param {String} token
   * @return {Object}
   */
  decode: (token) => jwt.decode(token)
}

module.exports = monitor('jwt.service', jwtService)
