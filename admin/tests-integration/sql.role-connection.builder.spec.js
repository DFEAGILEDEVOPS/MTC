'use strict'
/* global describe it expect fail */

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

const sut = require('../services/data-access/sql.role-connection.builder')
const roles = require('../lib/consts/roles')
const sqlConfig = require('../config/sql.config')
const config = require('../config')

describe('sql.role-connection.builder:integration', () => {
  it('should be defined', () => {
    expect(sut).toBeDefined()
  })

  it('should throw an error if role not supported', () => {
    try {
      sut.build('unknown role')
      fail('error should have been thrown')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBe('role not supported')
    }
  })

  it('should return default config when role is teacher', () => {
    const actual = sut.build(roles.teacher)
    expect(actual).toBeDefined()
    expect(typeof actual).toEqual('object')
    expect(actual.user).toEqual(sqlConfig.user)
    expect(actual.password).toEqual(sqlConfig.password)
    expect(actual.pool.min).toEqual(sqlConfig.pool.min)
    expect(actual.pool.max).toEqual(sqlConfig.pool.max)
  })

  it('should return specific config when role is techSupport', () => {
    const actual = sut.build(roles.techSupport)
    expect(actual).toBeDefined()
    expect(typeof actual).toEqual('object')
    expect(actual.user).toEqual(config.Sql.TechSupport.Username)
    expect(actual.password).toEqual(config.Sql.TechSupport.Password)
    expect(actual.pool.min).toEqual(config.Sql.TechSupport.Pool.Min)
    expect(actual.pool.max).toEqual(config.Sql.TechSupport.Pool.Max)
  })

  it('should be readonly if specified', () => {
    const actual = sut.build(roles.teacher, true)
    expect(actual).toBeDefined()
    expect(typeof actual).toEqual('object')
    expect(actual.options.readOnlyIntent).toBe(true)
  })

  it('should default to non read-only', () => {
    const actual = sut.build(roles.teacher)
    expect(actual).toBeDefined()
    expect(typeof actual).toEqual('object')
    expect(actual.options.readOnlyIntent).toBe(false)
  })
  it('should return deeply frozen config object', () => {
    const actual = sut.build(roles.teacher)
    expect(Object.isFrozen(actual)).toBe(true)
    expect(Object.isFrozen(actual.pool)).toBe(true)
  })
})
