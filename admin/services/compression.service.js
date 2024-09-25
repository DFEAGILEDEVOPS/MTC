'use strict'

const lzString = require('lz-string')
const fflate = require('fflate')

const moduleToExport = {
  /**
   * Compress a string using UTF-16
   * @param {string} string
   * @return {*|string}
   */
  compressToUTF16: function compress (string) {
    return lzString.compressToUTF16(string)
  },

  /**
   * Decompress a string from UTF-16
   * @param {string} string
   * @return {*|string|(string|null|undefined)}
   */
  decompressFromUTF16: function decompress (string) {
    return lzString.decompressFromUTF16(string)
  },

  /**
   * Compress a string using Base64
   * @param {string} string
   * @return {*|string}
   */
  compressToBase64: function compress (string) {
    return lzString.compressToBase64(string)
  },

  /**
   * Decompress a string from Base64
   * @param {string} string
   * @return {*|string|(string|null|undefined)}
   */
  decompressFromBase64: function decompress (string) {
    return lzString.decompressFromBase64(string)
  },

  /**
   *
   * @param data stringified object to compress
   * @returns base64 encoded string after gzip compression
   */
   compressToGzip: function compressToGzip (data) {
    const comp = fflate.gzipSync(strToU8(data), { level: 8, mem: 8 })
    const b64 = btoa(fflate.strFromU8(comp, true))
    return b64
  },

  /**
   *
   * @param data base64 encoded gzip data
   * @returns a stringified object (e.g. the payload)
   */
  decompressFromGzip: function  decompressFromGzip (b64Data) {
    // reverse base64 encoding
    const comp = atob(b64Data)
    // decompress gzip
    const uncompData = fflate.gunzipSync(fflate.strToU8(comp, true))
    const uncomp = fflate.strFromU8(uncompData)
    return uncomp
  }
}

module.exports = moduleToExport
