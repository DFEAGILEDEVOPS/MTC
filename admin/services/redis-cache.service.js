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
  'checkWindow.sqlFindActiveCheckWindow': ['checkWindow'],
  'group.sqlFindGroups': ['group', 'pupilGroup'],
  'schoolData.sqlFindOneById': ['sce', 'school']
}

redisCacheService.storedProceduresAffectedTables = {
  'spUpsertSceSchools': ['sce']
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
    let tables = []
    if (/DELETE|INSERT|UPDATE/.test(sql)) {
      const tableRegex = new RegExp('\\.\\[([a-z]+)\\]', 'gi')
      let match = false
      while ((match = tableRegex.exec(sql)) !== null) {
        tables.push(match[1])
      }
    }
    if (/EXEC/.test(sql)) {
      const spRegex = new RegExp('\\.\\[(sp[a-z]+)\\]', 'gi')
      let match = false
      let procedures = []
      while ((match = spRegex.exec(sql)) !== null) {
        procedures.push(match[1])
      }
      procedures.forEach(p => {
        const thisTables = redisCacheService.storedProceduresAffectedTables[p]
        if (thisTables) {
          tables = tables.concat(thisTables)
        }
      })
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
  })
}

redisCacheService.getFullKey = serviceKey => {
  if (!serviceKey) {
    return false
  }
  let affectedKey = serviceKey
  const keyParts = serviceKey.split('.')
  if (keyParts.length > 2) {
    // the key includes an identifier e.g. school_id
    affectedKey = `${keyParts[0]}.${keyParts[1]}`
  }
  const tables = redisCacheService.affectedTables[affectedKey]
  if (tables) {
    serviceKey = `${serviceKey}_${tables.join('-')}`
  }
  return serviceKey
}

module.exports = redisCacheService
