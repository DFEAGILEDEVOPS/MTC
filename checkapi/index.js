'use strict'

require('dotenv').config()
const http = require('http')
// const timer = require('simple-timer')
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

storageService.createTableIfNotExists(storageTargetName, function (error, result, response) {
  if (error) {
    throw new Error('unable to connect to azure storage:' + error.message)
  }
  if (debug) console.log('connected to azure storage service')
})

console.log(`running on ${machineName} (${os.cpus().length} cores) under process ${processId}.`)

http.createServer((request, response) => {
  // const { headers, method, url } = request
  if (request.method === 'GET' && request.url === '/') {
    response.write('Raw')
    response.statusCode = 200
    response.end()
  }

  if (request.method === 'GET' && request.url === '/loaderio-99a9565f58325293e217a36aa3ae695d.txt') {
    response.writeHead(200)
    response.end(fs.readFileSync(path.join(__dirname, 'public', 'loaderio-99a9565f58325293e217a36aa3ae695d.txt')))
  }

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
    body = Buffer.concat(body).toString()
    // add specific host info
    var obj = JSON.parse(body)
    var encodedData = Buffer.from(JSON.stringify(obj)).toString('base64')
    var tableEntry = {
      PartitionKey: entityGenerator.String(storageTargetName + new Date().getSeconds()),
      RowKey: entityGenerator.String(uuid().toString()),
      check: entityGenerator.String(encodedData),
      machine: entityGenerator.String(machineName),
      processId: entityGenerator.Int64(processId)
    }

    // TODO validation of request, authentication
    // timer.start('request')
    storageService.insertEntity(storageTargetName, tableEntry, function (error, result, queueResponse) {
      // timer.stop('request')
      // console.log(`queue call took ${timer.get('request').delta}ms`)
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
