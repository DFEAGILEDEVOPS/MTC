/* global Regex */
const Redis = require('ioredis')
const config = require('../config')
const sqlService = require('./data-access/sql.service')

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
  'pupilRegister.getPupilRegister': ['checkstatus', 'group', 'pupil', 'pupilgroup', 'pupilstatus', 'pupilrestart']
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

redisCacheService.dropAffectedCaches = sql => {
  return new Promise((resolve, reject) => {
    if (/^UPDATE|INSERT/.test(sql)) {
      const tableRegex = new Regex(`${sqlService.adminSchema}.[([a-z]+)]`, 'ig')
      const tables = sql.match(tableRegex)
      if (tables) {
        const stream = redis.scanStream({ match: `(_|-)(${tables.join('|')})` })
        stream.on('data', keys => {
          if (keys.length) {
            const pipeline = redis.pipeline()
            keys.forEach(key => {
              pipeline.del(key)
            })
            pipeline.exec()
          }
        })
        stream.on('end', resolve)
      } else {
        resolve()
      }
    }
  })
}

module.exports = redisCacheService
