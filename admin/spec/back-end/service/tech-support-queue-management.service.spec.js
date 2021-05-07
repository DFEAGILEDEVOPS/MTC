'use strict'

/* global describe, it, expect, spyOn */
const sut = require('../../../services/tech-support-queue-management.service')
const storageDataService = require('../../../services/data-access/storage-queue-metadata.service')
const serviceBusDataService = require('../../../services/data-access/service-bus-queue-metadata.service')

describe('tech support queue management service', () => {
  it('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  it('should combine active and poison queue messages into one array item', () => {
    spyOn(serviceBusDataService, 'getAllQueueMessageCounts')
    spyOn(storageDataService, 'getAllQueueMessageCounts')
  })
})
