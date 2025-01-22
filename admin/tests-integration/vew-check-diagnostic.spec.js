'use strict'

const path = require('path')
const fs = require('fs')
const globalDotEnvFile = path.join(__dirname, '..', '..', '.env')

const sql = require('../services/data-access/sql.service')
const redisCacheService = require('../services/data-access/redis-cache.service')

try {
  if (fs.existsSync(globalDotEnvFile)) {
    // console.log('globalDotEnvFile found', globalDotEnvFile)
    require('dotenv').config({ path: globalDotEnvFile })
  } else {
    console.warn('No .env file found at project root')
  }
} catch (error) {
  console.error(error)
}

describe('sql.service:integration', () => {
  beforeAll(async () => {
    await sql.initPool()
  })

  afterAll(async () => {
    await sql.drainPool()
    redisCacheService.disconnect()
  })

  describe('vewCheckDiagnostic', () => {
    test('column bindings should be valid', async () => {
      await sql.query('SELECT TOP 1 * FROM [mtc_admin].[vewCheckDiagnostic]')
    })
  })
})
