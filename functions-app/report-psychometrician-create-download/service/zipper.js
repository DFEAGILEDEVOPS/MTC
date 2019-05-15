'use strict'
const archiver = require('archiver')
const base = require('../../lib/base')
const fs = require('fs-extra')
const path = require('path')

const moduleToExport = {
  createZip: function createZip (fileName, fileName1, fileName2) {
    return new Promise((resolve, reject) => {
      if (!fileName1) {
        reject('Missing filename.  At least one file is required.')
      }
      const dirName = path.dirname(fileName1)
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
      this.logger(`Archiver: adding ${fileName1} `)
      archive.file(fileName1, { name: path.basename(fileName1) })

      if (fileName2) {
        this.logger(`Archiver: adding ${fileName2} `)
        archive.file(fileName2, { name: path.basename(fileName2) })
      }

      archive.finalize()
    })
  }
}

module.exports = Object.assign(moduleToExport, base)
