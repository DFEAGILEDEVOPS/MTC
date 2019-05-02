'use strict'

const functionName = 'test-fs-access'

const os = require('os')
const fs = require('fs-extra')
const path = require('path')
let logger

function createLargeFile (dir, filePrefix) {
  return new Promise(async (resolve, reject) => {
    const fname = `${dir}${path.sep}${filePrefix}`
    const stream = fs.createWriteStream(fname, { mode: 0o600 })
    for (let i = 0; i < 10000000; i++) {
      if(!stream.write(`Line of random text ${i}\n`)) {
        // Will pause every 16384 iterations until `drain` is emitted
        await new Promise(resolve => stream.once('drain', resolve));
      }
    }
    stream.end()
    stream.on('finish', function() {
      resolve(fname)
    });
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
      lines = data.split("\n");
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

const v1 = {
  process: async function (loggerArg) {
    logger = loggerArg

    // use this tmp dir for producing our work
    let newTmpDir

    try {
      newTmpDir = await createTmpDir(functionName + '-')
    } catch (error) {
      // don't panic
    }

    const fileName1 = await createLargeFile(newTmpDir, 'file1')
    logger(`File 1 created: ${fileName1}`)
    await readBack(fileName1)
    const f1Stat = await fs.stat(fileName1)
    console.log('File 1 size is ' + f1Stat.size)

    const fileName2 = await createLargeFile(newTmpDir, 'file2')
    logger(`File 2 created: ${fileName2}`)
    await readBack(fileName2)
    const f2Stat = await fs.stat(fileName2)
    console.log('File 2 size is ' + f2Stat.size)

    await cleanup(newTmpDir)
  }
}

module.exports = v1
