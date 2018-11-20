'use strict'

const validateMessage = require('./message-validator')

/* global describe it expect fail */

describe('message-validator', () => {
  it('throws if the message is not passed in', () => {
    try {
      validateMessage()
      fail()
    } catch (error) {
      expect(error.message).toBe('Message missing')
    }
  })

  it('throws if the message is not valid JSON', () => {
    try {
      validateMessage('JSON error')
      fail()
    } catch (error) {
      expect(error.message).toBe('Message is invalid')
    }
  })

  it('throws if the message does not have a version field', () => {
    try {
      validateMessage({ checkCode: 'abc', loginAt: '' })
      fail()
    } catch (error) {
      expect(error.message).toBe('Message version is unspecified')
    }
  })

  it('throws if the message does not have a checkCode field', () => {
    try {
      validateMessage({ version: 1, loginAt: '' })
      fail()
    } catch (error) {
      expect(error.message).toBe('Message is invalid: checkCode missing')
    }
  })

  it('throws if the message does not have a loginAt field', () => {
    try {
      validateMessage({ version: 1, checkCode: 'abc' })
      fail()
    } catch (error) {
      expect(error.message).toBe('Message is invalid: login date missing')
    }
  })
})
