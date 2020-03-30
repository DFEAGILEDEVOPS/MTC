'use strict'

/* global describe, it, expect */
const schoolSummaryService = require('../../../services/school-summary.service')

describe('schoolSummaryService', () => {
  it('should return a summary object', async () => {
    const summary = await schoolSummaryService.getSummary(1)
    expect(summary).toBeDefined()
  })
})
