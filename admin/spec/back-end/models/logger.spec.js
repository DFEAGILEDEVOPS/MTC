'use strict'
/* global describe expect test beforeEach */

const Logger = require('../../../models/logger')
require('../../../config')

describe('logger class', () => {
  test('can initialise', () => {
    const logger = new Logger()
    expect(typeof logger).toBe('object')
  })
  describe('has', () => {
    let logger
    beforeEach(() => {
      logger = new Logger()
    })

    test('a #log function', () => {
      expect(typeof logger.log).toBe('function')
      logger.log('info', 'log function test at info level')
    })

    test('a #alert function', () => {
      expect(typeof logger.alert).toBe('function')
      logger.alert('alert level test')
    })

    test('a #error function', () => {
      expect(typeof logger.error).toBe('function')
      logger.error('error level test')
    })

    test('a #warn function', () => {
      expect(typeof logger.warn).toBe('function')
      logger.warn('warn level test')
    })

    test('a #info function', () => {
      expect(typeof logger.info).toBe('function')
      logger.info('info level test')
    })

    test('a #debug function', () => {
      expect(typeof logger.debug).toBe('function')
      logger.debug('debug level test')
    })

    // You can log a single error
    // test('acceps a single exception param', () => {
    //   logger.error(new Error('unit test example error'))
    // })
  })
})
