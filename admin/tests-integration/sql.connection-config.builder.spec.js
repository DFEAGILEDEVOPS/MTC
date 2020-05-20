'use strict'
/* global describe beforeAll it expect fail spyOn afterAll */

const path = require('path')
const fs = require('fs')
const globalDotEnvFile = path.join(__dirname, '..', '..', '.env')

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

const sut = require('../services/data-access/sql.pool.service')

describe('sql.connection-config.builder:integration', () => {
  it('should be defined', () => {
    expect(sut).toBeDefined()
  })
})
