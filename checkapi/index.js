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

console.log(`running on ${machineName} (${os.cpus().length} cores) under process ${processId}.`)

http.createServer((request, response) => {
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
    }
    return
  }
  // fail if not posting complete check
  if (request.method !== 'POST' || request.url !== '/complete-check') {
    response.statusCode = 404
    response.end()
  }
  let body = []
  request.on('error', (err) => {
    console.error(err)
  }).on('data', (chunk) => {
    body.push(chunk)
  }).on('end', () => {
    response.on('error', (err) => {
      if (debug) console.error(err)
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
        response.writeHead(500)
        response.end()
      }
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end()
    })
  })
}).listen(process.env.PORT || 3003)
