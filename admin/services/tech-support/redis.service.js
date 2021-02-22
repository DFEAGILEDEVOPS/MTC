'use strict'

const redisCacheService = require('../data-access/redis-cache.service')



const redisService = {
  getServerInfo: async function getServerInfo () {
    const client = redisCacheService.getRedisClient()
    const data = await client.info()
    return data
  },

  getObjectMeta: async function getObjectMeta (key) {
    const val = await redisCacheService.get(key)
    const meta = {
      exists: 'false',
      length: 'N/A',
      ttl: 'N/A'
    }
    if (val) {
      meta.exists = 'true'
      const length = JSON.stringify(val).length
      meta.length = Intl.NumberFormat('en-GB').format(length)
      const ttl = await redisCacheService.getTtl(key)
      if (ttl > 0) {
        meta.ttl = Intl.NumberFormat('en-GB').format(ttl)
      }
    }
    return meta
  },

  validateKey: function validateKey (key) {
    if (key === undefined || key === null) return false
    if (typeof key !== 'string') return false
    const allowedPrefixes = [
      /^checkForms:/,
      /^checkWindow.sqlFindActiveCheckWindow$/,
      /^lacodes$/,
      /^group.sqlFindGroups/,
      /^pupil-uuid-lookup:/,
      /^pupilRegisterViewData:/,
      /^result:/,
      /^sasToken:/,
      /^schoolData.sqlFindOneById/,
      /^settings$/
    ]
    return allowedPrefixes.some(regex => { return regex.test(key) })
  },

  dropKeyIfAllowed: async function dropKeyIfAllowed (key) {
    const isAllowed = this.validateKey(key)
    if (!isAllowed) return false
    await redisCacheService.drop(key)
    return true
  }
}

module.exports = redisService
