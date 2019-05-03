'use strict'

const os = require('os')

const checkDisk = require('check-disk-space')

let logger

const v1 = {
  process: async function (loggerArg) {
    logger = loggerArg

    try {
      const disk = await checkDisk(os.tmpdir())
      logger(`Disk space size is ${disk.size} bytes`)
      logger(`Disk space free is ${disk.free} bytes`)
    } catch (error) {
      logger.error(`Failed to check disk space: ${error.message}`)
    }
  }
}

module.exports = v1
