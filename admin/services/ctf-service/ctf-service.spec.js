'use strict'
/* global describe expect it fail spyOn */
const moment = require('moment')

const sut = require('./ctf.service')
const ctfDataService = require('./data-access/ctf.data.service')
const checkWindowV2Service = require('../check-window-v2.service')
const resultsPageAvailabilityService = require('../results-page-availability.service')

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
    }
  })
})
