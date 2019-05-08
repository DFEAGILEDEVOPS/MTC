'use strict'

const functionName = 'test-fs-access'

const os = require('os')
const fs = require('fs-extra')
const path = require('path')

const archiver = require('archiver')
const checkDisk = require('check-disk-space')

let logger

function createLargeFile (dir, filePrefix) {
  return new Promise(async (resolve, reject) => {
    const fname = `${dir}${path.sep}${filePrefix}`
    const stream = fs.createWriteStream(fname, { mode: 0o600 })
    for (let i = 0; i < 10000000; i++) {
      if (!stream.write(`Line of random text ${i}\n`)) {
        // Will pause every 16384 iterations until `drain` is emitted
        await new Promise(resolve => stream.once('drain', resolve))
      }
    }
    stream.end()
    stream.on('finish', function () {
      resolve(fname)
    })
    stream.on('error', function (error) {
      reject(error)
    })
  })
}

/**
 * Create a unique directory in the system's temp dir
 * @param prefix
 * @return {*}
 */
async function createTmpDir (prefix) {
  return fs.mkdtemp(`${os.tmpdir()}${path.sep}${prefix}`)
}

function readBack (fileName) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(fileName)
    let data = ''
    let linesWanted = 10
    let lines

    stream.on('data', function (chunk) {
      data += chunk
      lines = data.split('\n')
      if (lines.length > linesWanted) {
        lines.length = linesWanted
        stream.destroy()
      }
    })

    stream.on('error', function (error) {
      console.error(`Error reading file ${fileName}: ${error.message}`)
      reject(error)
    })

    stream.on('end', function () {
      logger(`End event: Contents of ${fileName}: ${lines.join('\n')}`)
      resolve()
      data = null
    })

    stream.on('close', function () {
      logger(`Close event: Contents of ${fileName}: ${lines.join('\n')}`)
      resolve()
      data = null
    })
  })
}

async function cleanup (newTmpDir) {
  logger(`Cleanup is rimrafing: ${newTmpDir}`)
  return fs.remove(newTmpDir)
}

function createZip (fileName1, fileName2) {
  return new Promise((resolve, reject) => {
    const dirName = path.dirname(fileName1)
    const zipFileName = 'report.zip'
    const zipFileNameWithPath = `${dirName}${path.sep}${zipFileName}`

    const stream = fs.createWriteStream(zipFileNameWithPath, { mode: 0o600 })
    const archive = archiver('zip', {
      zlib: { level: 6 } // Sets the compression level.
    })

    // listen for all archive data to be written
    // 'close' event is fired only when a file descriptor is involved
    stream.on('close', function () {
      logger('Archive closed with ' + archive.pointer() + ' total bytes')
      logger('archiver has been finalized and the output file descriptor has closed.')
      resolve(zipFileNameWithPath)
    })

    // This event is fired when the data source is drained no matter what was the data source.
    // It is not part of this library but rather from the NodeJS Stream API.
    // @see: https://nodejs.org/api/stream.html#stream_event_end
    stream.on('end', function () {
      logger('Archiver: Data has been drained')
    })

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    stream.on('warning', function (error) {
      if (error.code === 'ENOENT') {
        logger('Archiver warning: ' + error.message)
      } else {
        // throw error
        reject(error)
      }
    })

    // good practice to catch this error explicitly
    stream.on('error', function (error) {
      reject(error)
    })

    // pipe archive data to the file
    archive.pipe(stream)

    // append files
    logger(`Adding ${fileName1} `)
    archive.file(fileName1, { name: path.basename(fileName1) })

    logger(`Adding ${fileName2} `)
    archive.file(fileName2, { name: path.basename(fileName2) })

    logger('Finalising...')
    archive.finalize()
  })
}

const v1 = {
  process: async function (loggerArg) {
    logger = loggerArg

    // use this tmp dir for producing our work
    let newTmpDir

    try {
      newTmpDir = await createTmpDir(functionName + '-')
    } catch (error) {
      logger.error(`${functionName}: Failed to created a new tmp directory: ${error.message}`)
      throw error // unrecoverable - no work can be done.
    }

    try {
      const disk = await checkDisk(newTmpDir)
      logger(`Disk space size is ${disk.size} bytes`)
      logger(`Disk space free is ${disk.free} bytes`)
    } catch (error) {
      logger.error(`Failed to check disk space: ${error.message}`)
    }


    const fileName1 = await createLargeFile(newTmpDir, 'file1')
    logger(`File 1 created: ${fileName1}`)
    await readBack(fileName1)
    const f1Stat = await fs.stat(fileName1)
    logger('File 1 size is ' + f1Stat.size)

    const fileName2 = await createLargeFile(newTmpDir, 'file2')
    logger(`File 2 created: ${fileName2}`)
    await readBack(fileName2)
    const f2Stat = await fs.stat(fileName2)
    logger('File 2 size is ' + f2Stat.size)

    try {
      logger('Zipping files...')
      const zipFileName = await createZip(fileName1, fileName2)
      logger('Zipfile created: ' + zipFileName)
      const zipStat = await fs.stat(zipFileName)
      logger('Zipfile size is ' + zipStat.size)
    } catch (error) {
      logger.error(error.message)
    }

    await cleanup(newTmpDir)
    logger('All done')
  }
}

module.exports = v1
