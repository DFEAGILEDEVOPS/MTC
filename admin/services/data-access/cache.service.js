'use strict'

const redis = require('redis')
const bluebird = require('bluebird')
bluebird.promisifyAll(redis)
const config = require('../../config')

let client

const service = {}

service.init = () => {
  console.dir(config.Redis)
  client = redis.createClient(config.Redis.Port, config.Redis.Host)
  client.on('error', function (err) {
    // TODO use logger
    console.error('Error ' + err)
  })
}

service.remove = async (key) => {
  return client.delAsync(key)
}

service.set = async (key, value) => {
  return client.setAsync(key, value)
}

service.get = async (key) => {
  return client.getAsync(key)
}

service.increment = async (key) => {
  return client.incrAsync(key)
}

module.exports = service
