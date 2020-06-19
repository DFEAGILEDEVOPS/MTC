'use strict'
/* global describe it expect */

const sut = require('./get-env')

describe('get-env', () => {
  describe('booleans', () => {
    it('returns the default if the prop is missing', () => {
      const res = sut.getEnvWithTypeOrDefault('foo', null, 'bar', {})
      expect(res).toBe('bar')
    })

    it('returns the prop if it exists', () => {
      const res = sut.getEnvWithTypeOrDefault('foo', null, 'bar', { foo: true })
      expect(res).toBe(true)
    })

    it('returns the casted prop if it exists', () => {
      const res = sut.getEnvWithTypeOrDefault('foo', sut.cast.toBoolean, 'bar', { foo: '1' })
      expect(res).toBe(true)
    })

    it('returns the casted prop if it exists', () => {
      const res = sut.getEnvWithTypeOrDefault('foo', sut.cast.toBoolean, 'bar', { foo: 'true' })
      expect(res).toBe(true)
    })

    it('returns the casted prop if it exists', () => {
      const res = sut.getEnvWithTypeOrDefault('foo', sut.cast.toBoolean, 'bar', { foo: '0' })
      expect(res).toBe(false)
    })

    it('returns the casted prop if it exists', () => {
      const res = sut.getEnvWithTypeOrDefault('foo', sut.cast.toBoolean, 'bar', { foo: 'false' })
      expect(res).toBe(false)
    })

    it('returns the casted prop if it exists', () => {
      const res = sut.getEnvWithTypeOrDefault('foo', sut.cast.toBoolean, 'bar', { foo: 'any other string' })
      expect(res).toBe(false)
    })
  })

  describe('ints', () => {
    it('returns the default if the prop is missing', () => {
      const res = sut.getEnvWithTypeOrDefault('foo', null, 0, {})
      expect(res).toBe(0)
    })

    it('returns the default if the prop is missing', () => {
      const res = sut.getEnvWithTypeOrDefault('foo', null, 100, {})
      expect(res).toBe(100)
    })

    it('returns the prop if it exists', () => {
      const res = sut.getEnvWithTypeOrDefault('foo', null, 42, { foo: 7 })
      expect(res).toBe(7)
    })

    it('returns the casted prop if it exists', () => {
      const res = sut.getEnvWithTypeOrDefault('foo', sut.cast.toInt, 42, { foo: '56' })
      expect(res).toBe(56)
    })

    it('returns the casted prop if it exists', () => {
      const res = sut.getEnvWithTypeOrDefault('foo', sut.cast.toInt, 42, { foo: '56.1' })
      expect(res).toBe(56)
    })

    it('returns the casted prop if it exists', () => {
      const res = sut.getEnvWithTypeOrDefault('foo', sut.cast.toInt, 42, { foo: '56.6' })
      expect(res).toBe(56)
    })
  })

  describe('numbers', () => {
    it('returns the default if the prop is missing', () => {
      const res = sut.getEnvWithTypeOrDefault('foo', null, 1.2, {})
      expect(res).toBe(1.2)
    })

    it('returns the default if the prop is missing', () => {
      const res = sut.getEnvWithTypeOrDefault('foo', null, 100, {})
      expect(res).toBe(100)
    })

    it('returns the prop if it exists', () => {
      const res = sut.getEnvWithTypeOrDefault('foo', null, 42, { foo: 7.34 })
      expect(res).toBe(7.34)
    })

    it('returns the casted prop if it exists', () => {
      const res = sut.getEnvWithTypeOrDefault('foo', sut.cast.toNumber, 42, { foo: '56' })
      expect(res).toBe(56)
    })

    it('returns the casted prop if it exists', () => {
      const res = sut.getEnvWithTypeOrDefault('foo', sut.cast.toNumber, 42, { foo: '56.1' })
      expect(res).toBe(56.1)
    })

    it('returns the casted prop if it exists', () => {
      const res = sut.getEnvWithTypeOrDefault('foo', sut.cast.toNumber, 42, { foo: '56.6' })
      expect(res).toBe(56.6)
    })
  })

  describe('strings', () => {
    it('returns the default if the prop is missing', () => {
      const res = sut.getEnvWithTypeOrDefault('foo', null, 'bar', {})
      expect(res).toBe('bar')
    })

    it('returns the prop if it exists', () => {
      const res = sut.getEnvWithTypeOrDefault('foo', null, 'bar', { foo: 'test' })
      expect(res).toBe('test')
    })
  })
})
