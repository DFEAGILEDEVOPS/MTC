'use strict'
const DfeSignInError = require('../../../error-types/dfe-signin-error')
/* global describe expect test */

describe('DfeSignInError class', () => {
  test('it initialises with 1 arg', () => {
    const err = new DfeSignInError('one arg')
    expect(err.message).toBe('one arg')
    expect(err instanceof DfeSignInError).toBe(true)
  })

  test('it initialises with 2 args', () => {
    const err = new DfeSignInError('first arg', 'second arg')
    expect(err.message).toBe('first arg')
    expect(err.userMessage).toBe('second arg')
    expect(err.name).toBe('DfeSignInError')
  })

  test('it initialise with 3 args', () => {
    const origError = new Error('orignal error')
    const err = new DfeSignInError('first arg', 'second arg', origError)
    expect(err.message).toBe('first arg')
    expect(err.userMessage).toBe('second arg')
    expect(err.originalError).toBe(origError)
  })

  test('it wraps an error without a user message', () => {
    const origError = new Error('orignal error')
    const err = new DfeSignInError('first arg', undefined, origError)
    expect(err.message).toBe('first arg')
    expect(err.userMessage).toBe('') // default from class
    expect(err.originalError).toBe(origError)
  })
})
