'use strict'
const laCodeDataService = require('./data-access/la-code.data.service')
const redisService = require('./data-access/redis-cache.service')
const redisKeyService = require('./redis-key.service')
const twentyMinutesAsMilliseconds = 1200000
const logService = require('./log.service')
const logger = logService.getLogger()

const laCodeService = {
  /**
   * Get the known LA Codes as an array of integers, first from the redis cache, or the SQL DB in the case of a miss.
   * @return {Promise<number[]|*>}
   */
  getLaCodes: async function getLaCodes () {
    let laCodes
    const redisKey = redisKeyService.getLaCodesKey()
    laCodes = await redisService.get(redisKey)
    logger.info('getLaCodes(): cache hit')
    if (laCodes) {
      console.log('LA COdes', laCodes)
      return laCodes
    }
    // Cache miss
    laCodes = await laCodeDataService.sqlGetLaCodes()
    await redisService.set(redisKey, laCodes, twentyMinutesAsMilliseconds)
    logger.info('getLACodes(): cache miss for LA Codes')
    console.log('DB laCodes', laCodes)
    return laCodes
  },

  /**
   * Return the LA Codes as a Set where the numbers are now zero padded strings
   * Used for checking the pupil UPN
   * @return {Promise<Set<any>>}
   */
  getLaCodeSetOfStrings: async function getLaCodeSetOfStrings () {
    const laCodes = await this.getLaCodes()
    const laCodeSet = new Set()
    laCodes.forEach(i => {
      laCodeSet.add(String(i).padStart(3, '0'))
    })
    return laCodeSet
  }
}

module.exports = laCodeService
