'use strict'
/* global describe expect it beforeEach */

import { Logger } from './log.service'
import config from '../config'

describe('logger class', () => {
  it('can initialise', () => {
    const logger = new Logger()
    expect(typeof logger).toBe('object')
  })
  describe('has', () => {
    let logger
    beforeEach(() => {
      logger = new Logger()
    })

    it('a #log function', () => {
      expect(typeof logger.log).toBe('function')
      logger.log('info', 'log function test at info level')
    })

    it('a #alert function', () => {
      expect(typeof logger.alert).toBe('function')
      logger.alert('alert level test')
    })

    it('a #error function', () => {
      expect(typeof logger.error).toBe('function')
      logger.error('error level test')
    })

    it('a #warn function', () => {
      expect(typeof logger.warn).toBe('function')
      logger.warn('warn level test')
    })

    it('a #info function', () => {
      expect(typeof logger.info).toBe('function')
      logger.info('info level test')
    })

    it('a #debug function', () => {
      expect(typeof logger.debug).toBe('function')
      logger.debug('debug level test')
    })
  })
})
