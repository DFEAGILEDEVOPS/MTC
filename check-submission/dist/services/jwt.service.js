'use strict';
const Promise = require('bluebird');
const moment = require('moment');
const jwt = Promise.promisifyAll(require('jsonwebtoken'));
const uuidv4 = require('uuid/v4');
const pupilDataService = require('./data-access/pupil.data.service');
const config = require('../config');
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
            throw new Error('Pupil is required');
        }
        if (!checkWindowEndDate) {
            throw new Error('Check window end date is required');
        }
        const jwtId = uuidv4();
        const jwtSecret = config.JwtSecret;
        await pupilDataService.sqlUpdate({ id: pupil.id, token: jwtSecret });
        // TODO: for additional security add in a device Id
        const payload = {
            iss: 'MTC Admin',
            sub: pupil.id,
            exp: moment(checkWindowEndDate).unix(),
            nbf: Math.floor(Date.now() / 1000),
            jwi: jwtId // JWT token ID
        };
        // Construct a JWT token
        const token = await jwt.sign(payload, jwtSecret);
        return { token, jwtSecret };
    },
    /**
     * Verify a token
     * @param {String} token
     * @return {boolean}
     */
    verify: async (token) => {
        if (!token) {
            throw new Error('Token is required');
        }
        // This does not verify the signature is valid
        const decoded = jwtService.decode(token);
        // Find the pupil in the subject to retrieve the secret
        const pupil = await pupilDataService.sqlFindOneById(decoded.sub);
        if (!pupil) {
            throw new Error('Subject not found');
        }
        if (!pupil.token) {
            throw new Error('Error - missing secret');
        }
        try {
            await jwt.verify(token, pupil.token);
        }
        catch (error) {
            throw new Error('Unable to verify: ' + error.message);
        }
        return true;
    },
    /**
     * Decodes a token
     * @param {String} token
     * @return {Object}
     */
    decode: (token) => jwt.decode(token)
};
module.exports = jwtService;
