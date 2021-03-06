'use strict'
const http = require('http')
const axios = require('axios')
const config = require('./config')
const faker = require('faker')

const chaosProxy = {

  /**
   * Decide whether to reply with the real server request
   */
  isChaosRequest: function isChaosRequest () {
    return Math.random() < (config.chaos.chaosPercentage / 100)
  },

  proxy: async function proxy (req, res) {
    const options = {
      path: req.url,
      method: req.method,
      url: `http://${config.proxy.destinationServer}:${config.proxy.destinationPort}${req.url}`
    }

    let data = ''
    // When this callback is called the headers have arrived, but not the request body.
    // which needs to be processed.

    req.on('data', chunk => {
      data += chunk
    })

    req.on('end', async () => {
      if (data) {
        options.data = JSON.parse(data) // assumes json
      }

      if (req.method === 'OPTIONS') {
        res.writeHead(200, {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE',
          'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
          'Content-Length': 0
        })
        console.log(`${(new Date().toISOString())} ${req.method} ${req.url} 200 CORS success`)
        return res.end()
      }

      let proxyRes
      try {
        proxyRes = await axios(options)
        res.writeHead(proxyRes.status, {
          'Content-Type': proxyRes.headers['content-type'],
          'Access-Control-Allow-Origin': '*',
        })
        res.write(JSON.stringify(proxyRes.data)) // assumes json
        console.log(`${(new Date().toISOString())} ${req.method} ${req.url} ${proxyRes.status}`)
      } catch (error) {
        // The proxy received a non-200 error code from the server
        console.log(`chaos-proxy: received server response ${error.response.status} ${error.response.statusText}`)
        const status = error.response.status ? error.response.status : 500
        res.writeHead(status, {
          'Content-Type': 'text/plain',
          'Access-Control-Allow-Origin': '*',
        })
        res.write('Error')
        console.log(`${(new Date().toISOString())} ${req.method} ${req.url} ${status} ${error.response.statusText}`)
      }
      return res.end()
    })
  },

  chaosRequest: async function chaosRequest (req, res) {
    let data = ''
    // When this callback is called the headers have arrived, but not the request body.
    // which needs to be processed.

    req.on('data', chunk => {
      data += chunk
    })

    req.on('end', async () => {
      // Pick a random error from our config
      const resp = faker.random.arrayElement(config.chaos.responses)
      // Ideally we do NOT want to provide CORS headers for a chaos request, as this simulates
      // as response from some Azure component before it reaches our app, so the app should retry a failed CORS
      // request unless it is a 2xx code.
      // res.writeHead(resp.status, { 'Content-type': 'text/plain',
      //   'Access-Control-Allow-Origin': '*',
      //   'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE',
      //   'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'})
      res.write(resp.msg || 'unknown')
      console.log(`${(new Date().toISOString())} ${req.method} ${req.url} ${resp.status}`)
      return res.end()
    })
  },

  handle: async function handle (req, res) {

    const isChaos = chaosProxy.isChaosRequest()
    if (!isChaos) {
      return chaosProxy.proxy(req, res)
    } else {
      return chaosProxy.chaosRequest(req, res)
    }
  }
}

module.exports = chaosProxy
