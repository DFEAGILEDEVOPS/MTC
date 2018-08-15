'use strict'

/* global describe expect it fail afterEach */

const config = require('../../../config')
const tableNameService = require('../../../services/table-name-service')

const origPrefix = config.Azure.tablePrefix

describe('table-name.service', () => {
  afterEach(() => {
    config.Azure.tablePrefix = origPrefix
  })

  it('has read-only table names', () => {
    try {
      tableNameService.NAMES.PREPARED_CHECK = 'alteredName'
      expect(tableNameService.NAMES.PREPARED_CHECK).toBe('prepare-check')
      fail('expected to throw')
    } catch (error) {
      expect(error.message).toMatch('Cannot')
    }
  })

  it('returns the prefixed queue name', () => {
    config.Azure.tablePrefix = 'unitTest'
    const tableName = tableNameService.getName(tableNameService.NAMES.PREPARED_CHECK)
    expect(tableName).toBe('unitTestPreparedCheck')
  })

  it('does not knacker the config for other tests', () => {
    expect(config.Azure.tablePrefix).not.toBe('unitTest')
  })

  it('throws an error if an unknown queue name is provided', () => {
    try {
      tableNameService.getName('magic string')
      fail('expected to throw')
    } catch (error) {
      expect(error.message).toBe('Table name not found: magic string')
    }
  })
})
