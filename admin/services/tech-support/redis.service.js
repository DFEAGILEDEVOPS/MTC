'use strict'

const redisCacheService = require('../data-access/redis-cache.service')

const redisService = {
  batchTokenKeyTypes: [
    { type: 'checkForm', label: 'Check forms', keyPrefix: 'checkForm' },
    { type: 'checkWindow', label: 'Check window', keyPrefix: 'checkWindow' },
    { type: 'group', label: 'Groups', keyPrefix: 'group' },
    { type: 'lacodes', label: 'LA Codes', keyPrefix: 'lacode' },
    { type: 'pupilRegister', label: 'Pupil Registers', keyPrefix: 'pupilRegister' },
    { type: 'qrcode', label: 'QR Codes', keyPrefix: 'qrCodeUrl' },
    { type: 'result', label: 'School results', keyPrefix: 'result' },
    { type: 'sasToken', label: 'SAS Tokens', keyPrefix: 'sasToken' },
    { type: 'schoolData', label: 'School data', keyPrefix: 'school' },
    { type: 'settings', label: 'Settings', keyPrefix: 'setting' }
  ],

  getServerInfo: async function getServerInfo () {
    const client = redisCacheService.getRedisClient()
    const data = await client.info()
    return data
  },

  get: async function get (key) {
    return redisCacheService.get(key)
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
      /^pupilRegisterViewData:/,
      /^result:/,
      /^sasToken:/,
      /^schoolData.sqlFindOneById/,
      /^settings$/
    ]
    return allowedPrefixes.some(regex => { return regex.test(key) })
  },

  validateBatchTokens: function validateBatchTokens (tokens) {
    // ensure that each token is a valid one
    console.log('validating tokens', tokens)
    if (!Array.isArray(tokens)) {
      if (typeof tokens === 'string') {
        tokens = [tokens]
      } else {
        throw new Error('Invalid tokens')
      }
    }
    if (tokens.length === 0) {
      throw new Error('Missing tokens')
    }
    const isBatchToken = (testToken) => {
      const element = redisService.batchTokenKeyTypes.find(obj => {
        return obj.type === testToken
      })
      return element !== undefined
    }
    const isAllowed = tokens.every(isBatchToken)
    return isAllowed
  },

  filterTokens: function filterTokens (tokens) {
    if (typeof tokens === 'string') {
      tokens = [tokens]
    }
    if (!Array.isArray(tokens)) {
      throw new Error('Invalid tokens')
    }
    if (tokens.length === 0) {
      throw new Error('Missing tokens')
    }
    const filtered = tokens.map(t => {
      const found = redisService.batchTokenKeyTypes.find(obj => obj.type === t)
      if (found === undefined) {
        throw new Error(`Token ${t} not found`)
      }
      return found
    })
    return filtered
  },

  dropKeyIfAllowed: async function dropKeyIfAllowed (key) {
    const isAllowed = this.validateKey(key)
    if (!isAllowed) return false
    await redisCacheService.drop(key)
    return true
  },

  /**
   * @param {string[]} keys - array of tokens (batchTokenKeyTypes.element.type) to drop
   */
  multiDrop: async function multiDrop (keys) {
    if (!Array.isArray(keys)) {
      throw new Error('keys is not an array')
    }
    const isValid = redisService.validateBatchTokens(keys)
    if (!isValid) {
      throw new Error('One of the batch tokens was invalid')
    }
    const keysElements = redisService.filterTokens(keys)
    for (const key of keysElements) {
      await redisCacheService.dropByPrefix(key.keyPrefix)
    }
  }
}

module.exports = redisService
