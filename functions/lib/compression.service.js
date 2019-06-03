'use strict'

const lzString = require('lz-string')

const moduleToExport = {
  /**
   * Compress a string
   * @param {string} string
   * @return {*|string}
   */
  compress: function compress (string) {
    return lzString.compressToUTF16(string)
  },

  /**
   * Decompress a string
   * @param {string} string
   * @return {*|string|(string|null|undefined)}
   */
  decompress: function decompress (string) {
    return lzString.decompressFromUTF16(string)
  }
}

module.exports = moduleToExport
