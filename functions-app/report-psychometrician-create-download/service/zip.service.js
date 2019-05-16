'use strict'
const archiver = require('archiver')
const base = require('../../lib/logger')
const fs = require('fs-extra')
const path = require('path')

const moduleToExport = {
  /**
   *
   * @param fileName
   * @param {Array} files
   * @return {Promise}
   */
  createZip: function createZip (fileName, files) {
    return new Promise((resolve, reject) => {
      if (!Array.isArray(files)) {
        reject(new Error('files must be an array'))
      }
      if (!Array.length > 0) {
        reject(new Error('There must be atr least one file to zip'))
      }

      const dirName = path.dirname(files[0])
      const zipFileName = fileName
      const zipFileNameWithPath = `${dirName}${path.sep}${zipFileName}`
      const loggerRef = this.logger

      const stream = fs.createWriteStream(zipFileNameWithPath, { mode: 0o600 })
      const archive = archiver('zip', {
        zlib: { level: 8 } // Sets the compression level.
      })

      // listen for all archive data to be written
      // 'close' event is fired only when a file descriptor is involved
      stream.on('close', function () {
        loggerRef('Archive closed with ' + archive.pointer() + ' total bytes')
        loggerRef('Archiver has been finalized and the output file descriptor has closed.')
        resolve(zipFileNameWithPath)
      })

      // This event is fired when the data source is drained no matter what was the data source.
      // It is not part of this library but rather from the NodeJS Stream API.
      // @see: https://nodejs.org/api/stream.html#stream_event_end
      stream.on('end', function () {
        loggerRef('Archiver: Data has been drained')
      })

      // catch warnings (ie stat failures and other non-blocking errors)
      stream.on('warning', function (error) {
        if (error.code === 'ENOENT') {
          loggerRef('Archiver warning: ' + error.message)
        } else {
          // throw error
          reject(error)
        }
      })

      stream.on('error', function (error) {
        reject(error)
      })

      // pipe archive data to the file
      archive.pipe(stream)

      // append files
      files.forEach(file => {
        loggerRef(`Archiver: adding ${file}`)
        archive.file(file, { name: path.basename(file) })
      })

      archive.finalize()
    })
  }
}

module.exports = Object.assign(moduleToExport, base)
