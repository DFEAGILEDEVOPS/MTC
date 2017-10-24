'use strict'

require('dotenv').config()
const http = require('http')
const fs = require('fs')
const path = require('path')
var os = require('os')
const machineName = os.hostname()
const processId = process.pid

const azure = require('azure-storage')
const storageService = azure.createTableService()
const storageTargetName = 'completechecks'
const entityGenerator = azure.TableUtilities.entityGenerator
const uuid = require('uuidv4')
const debug = process.env.NODE_ENV !== 'production'
let logger
if (process.env.LOGZ_KEY) {
  logger = require('logzio-nodejs').createLogger({
    token: process.env.LOGZ_KEY,
    host: 'listener.logz.io',
    type: 'wac-spike-mtc'
  })
}

const log = (data) => {
  if (logger) {
    logger.log(data)
  }
}

// grab disk data...
let buildId
try {
  buildId = fs.readFileSync(path.join(__dirname, 'build.txt'))
} catch (error) {
  buildId = 'unknown'
}

const loaderid = fs.readFileSync(path.join(__dirname, 'public', 'loaderio-99a9565f58325293e217a36aa3ae695d.txt'))

storageService.createTableIfNotExists(storageTargetName, function (error, result, response) {
  if (error) {
    throw new Error('unable to connect to azure storage:' + error.message)
  }
  if (debug) console.log('storage table initialised')
})

const validateRoute = (request, response) => {
  if (request.method === 'GET') {
    response.statusCode = 200
    switch (request.url) {
      case '/':
        response.end(`Hello from ${machineName}`)
        break
      case '/ping':
        response.end(buildId)
        break
      // load testing domain validation
      case '/loaderio-99a9565f58325293e217a36aa3ae695d.txt':
        response.end(loaderid)
        break
      default:
        response.statusCode = 404
        response.end()
        log({
          url: request.url,
          error: 404
        })
        return false
    }
  }

  if (request.method === 'POST' && request.url === '/complete-check') {
    return true
  }
  // catch all fails
  response.statusCode = 404
  response.end()
  log({
    url: request.url,
    error: 404
  })
  return false
}

console.log(`running on ${machineName} (${os.cpus().length} cores) under process ${processId}.`)

http.createServer((request, response) => {
  let body = []
  request.on('error', (err) => {
    log({
      type: 'request error',
      error: err
    })
  }).on('data', (chunk) => {
    body.push(chunk)
  }).on('end', () => {
    if (!validateRoute(request, response)) {
      return
    }

    response.on('error', (err) => {
      if (debug) { console.error(err) }
      log({
        type: 'response error',
        error: err
      })
    })

    const check = Buffer.concat(body).toString()
    var encodedCheck = Buffer.from(check).toString('base64')
    var tableEntry = {
      // at most, 60 partitions
      PartitionKey: entityGenerator.String(storageTargetName + new Date().getSeconds()),
      RowKey: entityGenerator.String(uuid().toString()),
      check: entityGenerator.String(encodedCheck),
      machine: entityGenerator.String(machineName),
      processId: entityGenerator.Int64(processId)
    }
    // TODO validation of request, authentication
    storageService.insertEntity(storageTargetName, tableEntry, function (error, result, queueResponse) {
      if (error) {
        if (debug) console.error(error)
        log({
          type: 'azure storage error',
          error: error
        })
        response.writeHead(500)
        response.end()
        return
      }
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end()
    })
  })
}).listen(process.env.PORT || 3003)
