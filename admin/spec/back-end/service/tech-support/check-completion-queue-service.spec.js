'use strict'

/* global describe, it, expect, spyOn fail */
const sut = require('../../../../services/tech-support/check-completion-queue.service')
const dataService = require('../../../../services/data-access/tech-support/check-completion-queue.data.service')

describe('check-completion-queue-service', () => {
  it('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  describe('createMessageForSingleCheck', () => {
    it('should throw if checkCode not provided', async () => {
      try {
        await sut.createMessageForSingleCheck()
        fail('error should have been thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toEqual('checkCode parameter is required')
      }
    })
  })
})
