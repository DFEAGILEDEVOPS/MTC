'use strict'

const redisCacheService = require('../data-access/redis-cache.service')

const redisService = {
  getServerInfo: async function getServerInfo () {
    const client = redisCacheService.getRedisClient()
    const data = await client.info()
    return data
  }
}

module.exports = redisService
