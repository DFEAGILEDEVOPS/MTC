'use strict'

/* global describe */

import { pupilAuthenticationService } from '../../services/pupil-authentication.service'

describe('pupilAuthenticationService', () => {
  const mockResult = {
    PartitionKey: { '$': 'Edm.String', _: 'bcd42dcd' },
    RowKey: { '$': 'Edm.String', _: '3598' },
    Timestamp: { '$': 'Edm.DateTime', _: new Date() },
    checkCode: { _: '09520D0D-A9CB-4651-9630-DD6698710120' },
    collectedAt: { '$': 'Edm.DateTime', _: '' },
    config: {
      _: '{\n  "questionTime": 6,\n  "loadingTime": 3,\n  "speechSynthesis": false\n}' },
    createdAt: { '$': 'Edm.DateTime', _: new Date() },
    hasCheckStarted: { _: false },
    isCollected: { _: false },
    pupil: {
      _: '{\n  "firstName": "Unit",\n  "lastName": "Test",\n  "dob": "1 December 1970",\n  "checkCode": "09520D0D-A9CB-4651-9630-DD6698710120"\n}' },
    questions: {
      _: '[\n  {\n    "order": 1,\n    "factor1": 2,\n    "factor2": 5\n  },\n  {\n    "order": 2,\n    "factor1": 11,\n    "factor2": 2\n  },\n  {\n    "order": 3,\n    "factor1": 5,\n    "factor2": 10\n  },\n  {\n    "order": 4,\n    "factor1": 4,\n    "factor2": 4\n  },\n  {\n    "order": 5,\n    "factor1": 3,\n    "factor2": 9\n  },\n  {\n"order": 6,\n    "factor1": 2,\n    "factor2": 4\n  },\n  {\n    "order": 7,\n    "factor1": 3,\n    "factor2": 3\n  },\n  {\n    "order": 8,\n    "factor1": 4,\n    "factor2": 9\n  },\n  {\n    "order": 9,\n    "factor1": 6,\n    "factor2": 5\n  },\n  {\n    "order": 10,\n    "factor1": 12,\n    "factor2": 12\n  }\n]' },
    school: {
      _: '{\n  "id": 2,\n  "name": "Example School"\n}'
    },
    tokens: {
      _: '{\n  "completedCheck": {\n    "sasToken": "st=token",\n    "url": "https://example.com/check-complete"\n  },\n  "jwtToken": "someToken"\n}'
    },
    updatedAt: { '$': 'Edm.DateTime', _: new Date() },
    '.metadata': {
      metadata: 'https://example.com/queue/foo',
      etag: 'W/"datetime\'2018-08-21T13%3A25%3A37.1004844Z\'"'
    }
  }

  const dummyDriver = {
    retrieveEntityAsync: jasmine.createSpy().and.returnValue(Promise.resolve({
      result: mockResult
    })),
    replaceEntityAsync: jasmine.createSpy().and.returnValue(Promise.resolve({
      response: { isSuccessful: true }
    }))
  }

  it('makes a call to retrieveEntityAsync', async () => {
    await pupilAuthenticationService.authenticate('1234', 'pin1', dummyDriver)
    expect(dummyDriver.retrieveEntityAsync).toHaveBeenCalled()
  })
})
