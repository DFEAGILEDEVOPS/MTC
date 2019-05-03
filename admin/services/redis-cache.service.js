var Redis = require('ioredis')
const config = require('../config')

let redisConfig = {
  port: config.Redis.Port,
  host: config.Redis.Host
}
if (config.Redis.Key) {
  redisConfig.password = config.Redis.Key
}
if (config.Redis.useTLS) {
  redisConfig.tls = { host: config.Redis.Host }
}

const redis = new Redis(redisConfig)

const redisCacheService = {}

redisCacheService.affectedTables = {
  'pupilRegister.getPupilRegister': ['checkStatus', 'group', 'pupil', 'pupilGroup', 'pupilStatus', 'pupilRestart']
}

redisCacheService.get = redisKey => {
  return new Promise((resolve, reject) => {
    redis.get(redisKey, (err, result) => {
      if (err || !result) {
        console.log(`Failed to retrieve \`${redisKey}\` from Redis`)
        if (err) {
          console.log(`Error: ${err.message}`)
        }
      } else {
        console.log(`Retrieved \`${redisKey}\` from Redis`)
      }
      resolve(result)
    })
  })
}

redisCacheService.set = (redisKey, data) => {
  return new Promise((resolve, reject) => {
    if (typeof data === 'object') {
      data = JSON.stringify(data)
    }
    redis.set(redisKey, data, () => {
      console.log(`Stored \`${redisKey}\` in Redis`)
      resolve()
    })
  })
}

module.exports = redisCacheService
