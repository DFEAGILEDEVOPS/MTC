'use strict'

require('dotenv').config()
const http = require('http')
// const timer = require('simple-timer')
const fs = require('fs')
const path = require('path')
const azure = require('azure-storage')
const queueService = azure.createQueueService()
const queueName = 'completedchecks'

queueService.createQueueIfNotExists(queueName, function (error, result, response) {
  if (error) {
    throw new Error('unable to connect to azure storage:' + error.message)
  }
  console.log('connected to azure queue service')
})

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
    body = Buffer.concat(body).toString()
    response.on('error', (err) => {
      console.error(err)
    })

    // TODO validation of request, authentication
    // timer.start('request')
    queueService.createMessage(queueName, body, function (error, result, queueResponse) {
      // timer.stop('request')
      // console.log(`queue call took ${timer.get('request').delta}ms`)
      if (error) {
        console.error(error)
        response.writeHead(500)
        response.end()
      }
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end()
    })
  })
}).listen(process.env.PORT || 3003)
