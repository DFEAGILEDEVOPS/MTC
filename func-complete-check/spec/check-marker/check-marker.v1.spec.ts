import * as Subject from '../../check-marker/check-marker.v1'
import uuid = require('uuid')
import moment = require('moment')

let sut: Subject.CheckMarkerV1

describe('check-marker/v1', () => {

  beforeEach(() => {
    sut = new Subject.CheckMarkerV1()
  })

  test('subject under test should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('error is thrown when receivedCheck reference is not found', async () => {
    try {
      const functionBindings: Subject.ICheckMarkerFunctionBindings = {
        receivedCheckTable: [],
        checkNotificationQueue: []
      }
      await sut.mark(functionBindings)
      fail('error should have been thrown due to empty receivedCheckData')
    } catch (error) {
      expect(error.message).toBe('received check reference is empty')
    }
  })
})
