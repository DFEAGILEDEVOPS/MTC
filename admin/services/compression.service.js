'use strict'

const lzString = require('lz-string')

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
  }
}

module.exports = moduleToExport
