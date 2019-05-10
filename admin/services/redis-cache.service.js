const Redis = require('ioredis')
const config = require('../config')
const azureQueueService = require('./azure-queue.service')
const queueNameService = require('./queue-name-service')

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
        console.log(`REDIS (get): Failed to retrieve \`${redisKey}\``)
        if (err) {
          console.log(`REDIS (get): Error: ${err.message}`)
        }
      } else {
        console.log(`REDIS (get): Retrieved \`${redisKey}\``)
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
      console.log(`REDIS (set): Stored \`${redisKey}\``)
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
            console.log(`REDIS (dropAffectedCaches): Dropped \`${key}\``)
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

const findKeys = pattern => {
  return new Promise((resolve, reject) => {
    let foundKeys = []
    const stream = redis.scanStream()
    stream.on('data', keys => {
      foundKeys = foundKeys.concat(keys.filter(key => pattern.test(key)))
    })
    stream.on('end', () => {
      resolve(foundKeys)
    })
  })
}

redisCacheService.update = (key, changes) => {
  return new Promise(async (resolve, reject) => {
    const keys = await findKeys(new RegExp(`^${key}_`))
    const foundKey = keys.length ? keys[0] : false
    if (!foundKey) {
      resolve(false)
    } else {
      redis.get(foundKey, (err, result) => {
        if (err || !result) {
          resolve(false)
        } else {
          result = JSON.parse(result)
          result.recordset = result.recordset.map(r => {
            if (changes.update && changes.update[r.id]) {
              for (let prop in changes.update[r.id]) {
                r[prop] = changes.update[r.id][prop]
              }
            }
            if (changes.delete && changes.delete.indexOf(r.id.toString()) > -1) {
              return false
            }
            return r
          }).filter(r => r !== false)
          redis.set(foundKey, JSON.stringify(result), async () => {
            console.log(`REDIS (update): Updated \`${key}\``)
            const sqlUpdateQueueName = queueNameService.getName(queueNameService.NAMES.SQL_UPDATE)
            await azureQueueService.addMessageAsync(sqlUpdateQueueName, { version: 2, messages: [changes] })
            console.log(`REDIS (update): Sent \`${key}\` update to \`sql-update\` message queue`)
            resolve(true)
          })
        }
      })
    }
  })
}

module.exports = redisCacheService
