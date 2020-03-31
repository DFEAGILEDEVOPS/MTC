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
  beforeEach(() => {
    spyOn(schoolSummaryDataService, 'getRegisterSummaryData')
      .and.returnValue(mockRegisterData)
  })

  it('should return a summary object', async () => {
    const summary = await schoolSummaryService.getSummary(1)
    expect(summary).toBeDefined()
  })

  it('should transform register data correctly', async () => {
    const summary = await schoolSummaryService.getSummary(1)
    expect(summary.register.completed).toBe(mockRegisterData.Completed)
    expect(summary.register.total).toBe(mockRegisterData.TotalCount)
    expect(summary.register.notTaking).toBe(mockRegisterData.NotAttending)
  })
})
