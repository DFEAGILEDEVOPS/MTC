'use strict'

const http = require('http')
const send = require('./send')
const receive = require('./receive')
const port = 3000

const requestHandler = (request, response) => {
  if (!request.url || request.url.includes('favicon')) {
    response.end()
  }
  console.log(`processing request for ${request.url}`)
  if (request.url.endsWith('rec')) {
    console.log('receiving messages...')
    receive()
  } else {
    send('hello')
  }
  response.end()
}

const server = http.createServer(requestHandler)

server.listen(port, (err) => {
  if (err) {
    return console.log('error:', err)
  }

  console.log(`server is listening on ${port}`)
})
