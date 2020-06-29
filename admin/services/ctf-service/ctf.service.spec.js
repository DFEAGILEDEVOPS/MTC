'use strict'
/* global describe expect it fail spyOn */
const moment = require('moment')

const sut = require('./ctf.service')
const ctfDataService = require('./data-access/ctf.data.service')
const checkWindowV2Service = require('../check-window-v2.service')
const resultsPageAvailabilityService = require('../results-page-availability.service')
const NotAvailableError = require('../../error-types/not-available')
const resultsStrings = require('../../lib/consts/mtc-results')

describe('ctfService', () => {
  const mockCheckWindow = {
    id: 1,
    checkEndDate: moment()
  }

  it('is defined', () => {
    expect(sut).toBeDefined()
  })

  it('has a method to download the xml results to send to the pupil as a file', () => {
    expect(sut.getSchoolResultDataAsXmlString).toBeDefined()
  })

  it('throws an error if the hdf has not been signed', async () => {
    spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue(mockCheckWindow)
    spyOn(ctfDataService, 'isHdfSigned').and.returnValue(false)
    try {
      await sut.getSchoolResultDataAsXmlString(1, 'Europe/London')
      fail('Expected to throw')
    } catch (error) {
      expect(error.message).toMatch(/the HDF has not been signed/i)
      expect(error instanceof NotAvailableError).toBe(true)
    }
  })

  it('throws an error if the results are not yet available to view', async () => {
    spyOn(checkWindowV2Service, 'getActiveCheckWindow').and.returnValue(mockCheckWindow)
    spyOn(ctfDataService, 'isHdfSigned').and.returnValue(true)
    spyOn(resultsPageAvailabilityService, 'isResultsFeatureAccessible').and.returnValue(false)
    try {
      await sut.getSchoolResultDataAsXmlString(1, 'Europe/London')
      fail('Expected to throw')
    } catch (error) {
      expect(error.message).toMatch(/the Results page is not yet available/i)
      expect(error instanceof NotAvailableError).toBe(true)
    }
  })

  describe('getCtfResult', () => {
    it('returns the score if they have taken the check', () => {
      const mockCtfResult = {
        score: 25
      }
      const res = sut.getCtfResult(mockCtfResult)
      expect(res).toBe(25)
    })

    it('returns "A" if our system has marked them as not attending because of absence', () => {
      const mockCtfResult = {
        score: null,
        pupilAttendanceCode: 'ABSNT'
      }
      const res = sut.getCtfResult(mockCtfResult)
      expect(res).toBe('A')
    })

    it('returns "B" if our system has marked them as not attending because they are working below expectation', () => {
      const mockCtfResult = {
        score: null,
        pupilAttendanceCode: 'BLSTD'
      }
      const res = sut.getCtfResult(mockCtfResult)
      expect(res).toBe('B')
    })

    it('returns "J" if our system has marked them as not attending because they have just arrived', () => {
      const mockCtfResult = {
        score: null,
        pupilAttendanceCode: 'JSTAR'
      }
      const res = sut.getCtfResult(mockCtfResult)
      expect(res).toBe('J')
    })

    it('returns "L" if our system has marked them as not attending because they have left the school', () => {
      const mockCtfResult = {
        score: null,
        pupilAttendanceCode: 'LEFTT'
      }
      const res = sut.getCtfResult(mockCtfResult)
      expect(res).toBe('L')
    })

    it('returns "U" if our system has marked them as not attending because they are unable to access the check', () => {
      const mockCtfResult = {
        score: null,
        pupilAttendanceCode: 'NOACC'
      }
      const res = sut.getCtfResult(mockCtfResult)
      expect(res).toBe('U')
    })

    it('returns "Z" if our system has marked them as not attending because they are incorrectly registered', () => {
      const mockCtfResult = {
        score: null,
        pupilAttendanceCode: 'INCRG'
      }
      const res = sut.getCtfResult(mockCtfResult)
      expect(res).toBe('Z')
    })

    it('returns "X" if our system has them attending but they have not had a pin generated', () => {
      const mockCtfResult = {
        score: null,
        pupilAttendanceCode: null,
        status: resultsStrings.didNotParticipate
      }
      const res = sut.getCtfResult(mockCtfResult)
      expect(res).toBe('X')
    })

    it('returns "X" if our system has them attending and they had a PIN generated but did not take the check', () => {
      const mockCtfResult = {
        score: null,
        pupilAttendanceCode: null,
        status: resultsStrings.incomplete
      }
      const res = sut.getCtfResult(mockCtfResult)
      expect(res).toBe('X')
    })

    it('returns "X" if our system has them attending and they did not take the restart', () => {
      const mockCtfResult = {
        score: null,
        pupilAttendanceCode: null,
        status: resultsStrings.restartNotTaken
      }
      const res = sut.getCtfResult(mockCtfResult)
      expect(res).toBe('X')
    })
  })
})
