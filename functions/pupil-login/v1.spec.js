'use strict'

/* global describe, expect, it, spyOn, beforeEach, beforeAll */

const azureStorageHelper = require('../lib/azure-storage-helper')

describe('pupil-login: v1-process', () => {
  const message = { checkCode: 'abc-def-123', loginAt: '2018-12-31T16:23:59.123Z', version: 1 }

  let sqlHelper, v1

  beforeAll(() => {
    sqlHelper = require('../lib/sql-helper')
    v1 = require('./v1')
  })

  beforeEach(() => {
    spyOn(v1, 'sqlUpdateLoginTimestampAndCheckStatus')
    spyOn(sqlHelper, 'sqlFindCheckByCheckCode').and.returnValue(Promise.resolve({ pupil_id: 1 }))
    spyOn(azureStorageHelper, 'addMessageToQueue')
  })

  it('makes a call to update pupil login date and check status', async () => {
    await v1.process(message)
    expect(v1.sqlUpdateLoginTimestampAndCheckStatus).toHaveBeenCalled()
  })

  it('fetches the check so it can get the pupil Id', async () => {
    await v1.process(message)
    expect(sqlHelper.sqlFindCheckByCheckCode).toHaveBeenCalled()
  })

  it('adds a message to the pupil-status queue to update the pupil status', async () => {
    await v1.process(message)
    expect(azureStorageHelper.addMessageToQueue).toHaveBeenCalled()
  })
})
