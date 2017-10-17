'use strict'

require('dotenv').config()
const http = require('http')
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
  let body = []
  request.on('error', (err) => {
    console.error(err)
  }).on('data', (chunk) => {
    body.push(chunk)
  }).on('end', () => {
    body = Buffer.concat(body).toString()
    // TODO validation of request, authentication
    queueService.createMessage(queueName, body, function (error, result, queueResponse) {
      if (error) {
        console.error(error)
      }
      response.on('error', (err) => {
        console.error(err)
      })
      response.writeHead(200, { 'Content-Type': 'application/json' })
      response.end()
    })
  })
}).listen(process.env.PORT || 3003)
