'use strict'

/* global describe, it, expect, beforeEach, spyOn */
const schoolSummaryService = require('../../../services/school-summary.service')
const schoolSummaryDataService = require('../../../services/data-access/school-summary.data.service')

describe('schoolSummaryService', () => {
  const mockRegisterData = {
    Completed: 5,
    TotalCount: 10,
    NotAttending: 5
  }
  const mockLiveData = [
    {
      Date: '5th July',
      PinsGenerated: 3,
      LoggedIn: 1,
      Complete: 2
    },
    {
      Date: '4th April',
      PinsGenerated: 10,
      LoggedIn: 3,
      Complete: 6
    }
  ]
  const mockTioData = [
    {
      Date: '5th July',
      PinsGenerated: 3
    },
    {
      Date: '1st July',
      PinsGenerated: 7
    }
  ]
  beforeEach(() => {
    spyOn(schoolSummaryDataService, 'getRegisterData').and.returnValue(mockRegisterData)
    spyOn(schoolSummaryDataService, 'getLiveCheckData').and.returnValue(mockLiveData)
    spyOn(schoolSummaryDataService, 'getTioCheckData').and.returnValue(mockTioData)
  })

  it('should be defined', async () => {
    expect(schoolSummaryService).toBeDefined()
  })

  it('should transform register data correctly', async () => {
    const summary = await schoolSummaryService.getSummary(1)
    expect(summary.register.completed).toBe(mockRegisterData.Completed)
    expect(summary.register.total).toBe(mockRegisterData.TotalCount)
    expect(summary.register.notTaking).toBe(mockRegisterData.NotAttending)
  })
})
