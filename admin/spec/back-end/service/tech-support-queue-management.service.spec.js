'use strict'

/* global describe, it, expect, spyOn beforeEach fail */
const sut = require('../../../services/tech-support-queue-management.service')

describe('tech support queue management service', () => {
  it('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  it('should combine active and poison queue messages into one array item', () => {
    fail('not implemented')
  })
})
