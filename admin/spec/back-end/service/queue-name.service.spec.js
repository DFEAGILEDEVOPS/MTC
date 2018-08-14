'use strict'

/* global describe expect it fail afterEach */

const config = require('../../../config')
const queueNameService = require('../../../services/queue-name-service')

const origPrefix = config.Azure.queuePrefix

describe('queue-name.service', () => {
  afterEach(() => {
    config.Azure.queuePrefix = origPrefix
  })

  it('has read-only queue names', () => {
    try {
      queueNameService.NAMES.PREPARE_CHECK = 'alteredName'
      expect(queueNameService.NAMES.PREPARE_CHECK).toBe('prepare-check')
      fail('expected to throw')
    } catch (error) {
      expect(error.message).toMatch('Cannot')
    }
  })

  it('returns the prefixed queue name', () => {
    config.Azure.queuePrefix = 'unit-test'
    const queueName = queueNameService.getName(queueNameService.NAMES.PREPARE_CHECK)
    expect(queueName).toBe('unit-test-prepare-check')
  })

  it('does not knacker the config for other tests', () => {
    expect(config.Azure.queuePrefix).not.toBe('unit-test')
  })

  it('throws an error if an unknown queue name is provided', () => {
    try {
      queueNameService.getName('magic string')
      fail('expected to throw')
    } catch (error) {
      expect(error.message).toBe('Queue not found: magic string')
    }
  })
})
