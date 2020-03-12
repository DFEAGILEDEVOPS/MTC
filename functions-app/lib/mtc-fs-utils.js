'use strict'

const fs = require('fs-extra')
const os = require('os')
const path = require('path')

const base = require('./logger')
const functionName = 'mtc-fs-utils'

const mtcFsUtils = {
  /**
   * Work out if we can use the supplied path as a writeable directory.  If not, use os.tmpdir
   * @param {String} path - the directory we want to write to
   * @return {Promise<string|*>}
   */
  getDirectoryOrFallback: async function getDirectoryOrFallback (dir) {
    // TODO: For Functions on Azure the os.tmpdir() should not be used, because of their complex network fileshare mounts
    // we need to find an actual home dir on locally attached storage.
    if (!dir) return os.tmpdir()
    try {
      await this.validateDirectory(dir)
    } catch (error) {
      return os.tmpdir()
    }
    return dir
  },
  /**
   * Create a unique directory in the system's temp dir; can be overridden by config.PsReportTemp
   * @param prefix - the prefix in the name of the new directory to be created
   * @return {*}
   */
  createTmpDir: async function createTmpDir (prefix, dir = null) {
    const tmpDir = await this.getDirectoryOrFallback(dir)
    this.logger(`${functionName}: setting tmpDir to ${tmpDir}`)
    return fs.mkdtemp(`${tmpDir}${path.sep}${prefix}`)
  },
  /**
   * Validate that a directory exists, and is readable and writeable
   * @param dir
   * @return {Promise<void>}
   */
  validateDirectory: async function validateDirectory (dir) {
    try {
      const stat = await fs.stat(dir)
      if (!stat.isDirectory()) {
        throw new Error(`Not a directory: ${dir}: stat: ${JSON.stringify(stat)}`)
      }
      await fs.access(dir, fs.constants.W_OK | fs.constants.R_OK)
      this.logger(`${functionName} directory confirmed: ${dir}`)
    } catch (error) {
      this.logger.error(`Stat failed: tmp directory validation failed: ${error.message}`)
      throw error
    }
  }
}

module.exports = Object.assign(mtcFsUtils, base)
