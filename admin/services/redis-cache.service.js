const Redis = require('ioredis')
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
  'checkWindow.sqlFindActiveCheckWindow': ['checkWindow']
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
      const tableRegex = new RegExp('\\.\\[([a-z]+)\\]', 'gi')
      let match = false
      let tables = []
      while ((match = tableRegex.exec(sql)) !== null) {
        tables.push(match[1])
      }
      if (tables.length) {
        const stream = redis.scanStream()
        stream.on('data', keys => {
          const keyRegex = new RegExp(`(_|-)(${tables.join('|')})`, 'i')
          const matchedKeys = keys.filter(k => keyRegex.test(k))
          if (matchedKeys.length) {
            const pipeline = redis.pipeline()
            matchedKeys.forEach(key => {
              console.log(`Dropped \`${key}\` from Redis`)
              pipeline.del(key)
            })
            pipeline.exec()
          }
        })
        stream.on('end', resolve)
      } else {
        resolve()
      }
    } else {
      resolve()
    }
  })
}

module.exports = redisCacheService
