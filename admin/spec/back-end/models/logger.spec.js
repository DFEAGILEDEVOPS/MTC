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

    test('a #alert function', () => {
      expect(typeof logger.alert).toBe('function')
      logger.alert('alert level test')
    })

    test('a #alert function with ex', () => {
      expect(typeof logger.alert).toBe('function')
      const ex = new Error('unit test ignore')
      logger.alert('alert level test with ex', ex)
    })

    test('a #error function', () => {
      expect(typeof logger.error).toBe('function')
      logger.error('error level test')
    })

    test('a #error function with ex', () => {
      expect(typeof logger.error).toBe('function')
      const ex = new Error('unit test ignore')
      logger.error('error level test', ex)
    })

    test('a #warn function', () => {
      expect(typeof logger.warn).toBe('function')
      logger.warn('warn level test')
    })

    test('a #warn function with ex', () => {
      const ex = new Error('unit test ignore')
      expect(typeof logger.warn).toBe('function')
      logger.warn('warn level test', ex)
    })

    test('a #info function', () => {
      expect(typeof logger.info).toBe('function')
      logger.info('info level test')
    })

    test('a #info function with ex', () => {
      expect(typeof logger.info).toBe('function')
      const ex = new Error('unit test ignore')
      logger.info('info level test', ex)
    })

    test('a #debug function', () => {
      expect(typeof logger.debug).toBe('function')
      logger.debug('debug level test')
    })

    test('a #debug function with ex', () => {
      expect(typeof logger.debug).toBe('function')
      const ex = new Error('unit test ignore')
      logger.debug('debug level test', ex)
    })
  })
})
