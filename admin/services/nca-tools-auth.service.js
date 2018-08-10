'use strict'

const iconv = require('iconv-lite')
const crypto = require('crypto')
const moment = require('moment')
const monitor = require('../helpers/monitor')

const service = {
  /**
   * @description decrypt and validate nca tools request payload
 * @param {String} encKey  (base64 encoded)
 * @param {String} encIv   (base64 encoded)
 * @param {String} encData (base64 encoded)
 * @param {String} encSignature (base64 encoded)
 * @return {object} Example output: { School: 999, EmailAddress: me@mydomain.com, ... }
 */
  authenticate: (encKey, encIv, encData, encSignature, ncaToolsPublicKey, mtcPrivateKey) => {
    if (!(encKey && encIv && encData && encSignature && ncaToolsPublicKey && mtcPrivateKey)) {
      throw new Error('Missing parameters')
    }

    /**
     * Step 1: verify we can decrypt the signature, with the sender's public key
     * @type {boolean}
     */
    // const isVerified = verifySignature(
    //   Buffer.from(encSignature, 'base64'),
    //   Buffer.from(encData, 'base64'),
    //   ncaToolsPublicKey
    // )
    const isVerified = true

    if (!isVerified) {
      // the signature does not verify, so the user cannot be logged in.
      // There is no point continuing.
      throw new Error('Signature failed verification')
    }

    const key = rsaDecrypt(Buffer.from(encKey, 'base64'), mtcPrivateKey)
    const iv = rsaDecrypt(Buffer.from(encIv, 'base64'), mtcPrivateKey)

    // Decrypt the message data, which was encrypted with the key and IV
    const plaintext = decryptMessage(Buffer.from(encData, 'base64'), key, iv)

    if (!plaintext) {
      throw new Error('Failed to decrypt message')
    }

    const data = parseMessage(plaintext)

    if (!data.SessionToken) {
      throw new Error('No session token provided')
    }

    return data
  }
}

module.exports = monitor('nca-tools-auth.service', service)

/**
 * Verify the provided signature is valid. - commented out at the moment, see the check on line 25
 *
 * This requires decrypting the signature with the TSO public key, and checking the digest
 * matches the current SH1 hash of the encrypted message data.  This implementation uses raw
 * Buffers as the provider system appears to be using UTF16.
 *
 * See: https://nodejs.org/api/crypto.html#crypto_class_verify
 *
 * @param {Buffer} sig - Buffer containing the encrypted signature
 * @param {Buffer} data - Buffer containing the encrypted message data
 * @param {String} senderPublicKey - String containing the public RSA key (PEM format) of the sender
 * @return {boolean} - true is the sig is verified, false otherwise
 */
// function verifySignature (sig, data, senderPublicKey) {
//   const verify = crypto.createVerify('RSA-SHA1')
//   verify.update(data)
//   return verify.verify(senderPublicKey, sig)
// }

/**
 * Decryption using the MTC RSA private key
 *
 * See: https://nodejs.org/api/crypto.html#crypto_crypto_privatedecrypt_private_key_buffer
 *
 * @param {Buffer} buffer - encrypted data
 * @return {Buffer} - Buffer containing plaintext
 */
function rsaDecrypt (buffer, privateKey) {
  return crypto.privateDecrypt(privateKey, buffer)
}

/**
 * decryptMessage() Decryption using symmetric cipher, uses key and iv
 *
 * See: https://nodejs.org/api/crypto.html#crypto_class_decipher
 *
 * @param {Buffer} encryptedBuffer
 * @param {Buffer} key
 * @param {Buffer} iv
 * @return {String}
 */
function decryptMessage (encryptedBuffer, key, iv) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
  const buffer1 = decipher.update(encryptedBuffer)
  const buffer2 = decipher.final()
  const finalBuffer = Buffer.concat([buffer1, buffer2])
  return iconv.decode(finalBuffer, 'utf16')
}

/**
 * Parse a string into an object lke this
 * Example string: 'School=999;EmailAddress=me@mydomain.com;Key=Value'
 * Example output: { School: 999, EmailAddress: me@mydomain.com, ... }
 *
 * @param {String} plaintext
 * @return {Object}
 */
function parseMessage (plaintext) {
  const arr = plaintext.split(';')
  let data = {}
  arr.forEach(val => {
    let [k, v] = val.split('=')
    data[k] = v
  })

  // Change the School value to be a Number, so we can pass it directly to data store
  if (data.School) {
    data.School = parseInt(data.School, 10)
  }

  // Record the logon
  data.logonAt = moment.utc()

  return data
}
