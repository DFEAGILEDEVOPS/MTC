'use string'

const lzString = require('lz-string')
const mssql = require('mssql')

/**
 *
 * @param {string} input compressed UTF-16 string
 * @returns {string} decompressed string
 */
function decompress (input) {
  return lzString.decompressFromUTF16(input)
}

/**
 *
 * @param {string} checkCode the checkCode of the entry to lookup in mtc_admin.receivedCheck
 * @returns {string} UTF-16 encoded compressed string of check data
 */
function getArchive (checkCode) {

}
