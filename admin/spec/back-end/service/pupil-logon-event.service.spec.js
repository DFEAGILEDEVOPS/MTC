'use strict'

/* global describe it spyOn expect fail */

const winston = require('winston')

const pupilLogonEventDataService = require('../../../services/data-access/pupil-logon-event.data.service')

describe('pupilLogonEventService', () => {
  let pupilId = 1
  let schoolPin = 'zzz12345'
  let pupilPin = '1234'
  const service = require('../../../services/pupil-logon-event.service')

  it('calls sqlCreate to save the save', async () => {
    spyOn(pupilLogonEventDataService, 'sqlCreate')
    await service.storeLogonEvent(pupilId, schoolPin, pupilPin, true, 200)
    expect(pupilLogonEventDataService.sqlCreate).toHaveBeenCalled()
  })

  it('truncates a long schoolPin', async () => {
    spyOn(pupilLogonEventDataService, 'sqlCreate')
    await service.storeLogonEvent(pupilId, 'x'.repeat(100), pupilPin, false, 401)
    const data = pupilLogonEventDataService.sqlCreate.calls.mostRecent().args[0]
    expect(data.schoolPin.length).toBe(50)
  })

  it('truncates a long pupilPin', async () => {
    spyOn(pupilLogonEventDataService, 'sqlCreate')
    await service.storeLogonEvent(pupilId, schoolPin, 'x'.repeat(100), false, 401)
    const data = pupilLogonEventDataService.sqlCreate.calls.mostRecent().args[0]
    expect(data.pupilPin.length).toBe(50)
  })

  it('adds the pupilId if present', async () => {
    spyOn(pupilLogonEventDataService, 'sqlCreate')
    await service.storeLogonEvent(pupilId, schoolPin, pupilPin, true, 200)
    const data = pupilLogonEventDataService.sqlCreate.calls.mostRecent().args[0]
    expect(data.pupil_id).toBe(pupilId)
  })

  it('omits pupilId if not present', async () => {
    spyOn(pupilLogonEventDataService, 'sqlCreate')
    await service.storeLogonEvent(null, schoolPin, pupilPin, true, 200)
    const data = pupilLogonEventDataService.sqlCreate.calls.mostRecent().args[0]
    expect(data.hasOwnProperty('pupil_id')).toBeFalsy()
  })

  it('adds the httpErrorMessage if present', async () => {
    spyOn(pupilLogonEventDataService, 'sqlCreate')
    await service.storeLogonEvent(pupilId, schoolPin, pupilPin, false, 401, 'mock message')
    const data = pupilLogonEventDataService.sqlCreate.calls.mostRecent().args[0]
    expect(data.httpErrorMessage).toBe('mock message')
  })

  it('omits the httpErrorMessage if not present', async () => {
    spyOn(pupilLogonEventDataService, 'sqlCreate')
    await service.storeLogonEvent(pupilId, schoolPin, pupilPin, true, 200)
    const data = pupilLogonEventDataService.sqlCreate.calls.mostRecent().args[0]
    expect(data.hasOwnProperty('httpErrorMessage')).toBeFalsy()
  })

  it('produces a warning if the database save threw an error', async () => {
    spyOn(pupilLogonEventDataService, 'sqlCreate').and.throwError('mock')
    spyOn(winston, 'warn')
    try {
      const res = await service.storeLogonEvent(pupilId, schoolPin, pupilPin, true, 200)
      expect(res).toBeFalsy()
    } catch (error) {
      fail('expected NOT to throw')
    }
    expect(winston.warn).toHaveBeenCalled()
  })
})
