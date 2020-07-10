'use strict'

/* global describe it expect fail */

const sut = require('../../../services/retro-input-assistant.service')

describe('retro input assistant service', () => {
  it('should be defined', () => {
    expect(sut).toBeDefined()
  })

  it('should throw if input assistant first name is undefined', async () => {
    try {
      await sut.save(undefined, 'smith', 'reason', 1)
      fail('error should have been thrown')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBe('input assistant first name is required')
    }
  })

  it('should throw if input assistant first name is an empty string', async () => {
    try {
      await sut.save('', 'smith', 'reason', 1)
      fail('error should have been thrown')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBe('input assistant first name is required')
    }
  })

  it('should throw if input assistant last name is undefined', async () => {
    try {
      await sut.save('john', undefined, 'reason', 1)
      fail('error should have been thrown')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBe('input assistant last name is required')
    }
  })

  it('should throw if input assistant last name is an empty string', async () => {
    try {
      await sut.save('john', '', 'reason', 1)
      fail('error should have been thrown')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBe('input assistant last name is required')
    }
  })

  it('should throw if input assistant reason is undefined', async () => {
    try {
      await sut.save('john', 'smith', undefined, 1)
      fail('error should have been thrown')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBe('input assistant reason is required')
    }
  })

  it('should throw if input assistant reason is an empty string', async () => {
    try {
      await sut.save('john', 'smith', '', 1)
      fail('error should have been thrown')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBe('input assistant reason is required')
    }
  })

  it('should throw if checkId is undefined', async () => {
    try {
      await sut.save('john', 'smith', 'reason', undefined)
      fail('error should have been thrown')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBe('checkId is required')
    }
  })

  it('should throw if checkId is less than 1', async () => {
    try {
      await sut.save('john', 'smith', 'reason', 0)
      fail('error should have been thrown')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBe('checkId is required')
    }
  })

  it('should throw if pupilUuid is undefined', async () => {
    try {
      await sut.save('john', 'smith', 'reason', 1, undefined)
      fail('error should have been thrown')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBe('valid pupil uuid is required')
    }
  })

  it('should throw if checkId is less than 1', async () => {
    try {
      fail('replace with uuid validator')
      await sut.save('john', 'smith', 'reason', 1, '')
      fail('error should have been thrown')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBe('valid pupil uuid is required')
    }
  })
})
