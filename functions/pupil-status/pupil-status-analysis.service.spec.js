'use strict'

/* global describe expect it */

const pupilStatusAnalysisService = require('./pupil-status-analysis.service')

describe('pupil-status-analysis.service', () => {
  it('returns UNALLOC for a pupil with no checks', () => {
    const data = [
      {
        pupil_id: 12,
        pupilStatusCode: 'UNALLOC',
        check_id: null,
        checkStatusCode: null,
        pupilAttendance_id: null
      }
    ]
    const targetStatus = pupilStatusAnalysisService.analysePupilData(data)
    expect(targetStatus).toBe('UNALLOC')
  })

  it('returns ALLOC for a pupil with a check in NEW state', () => {
    const data = [
      {
        pupil_id: 12,
        pupilStatusCode: 'UNALLOC',
        check_id: 1,
        checkStatusCode: 'NEW',
        pupilAttendance_id: null
      }
    ]
    const targetStatus = pupilStatusAnalysisService.analysePupilData(data)
    expect(targetStatus).toBe('ALLOC')
  })

  it('returns ALLOC for a pupil with a check in NEW state', () => {
    const data = [
      {
        pupil_id: 12,
        pupilStatusCode: 'UNALLOC',
        check_id: 1,
        checkStatusCode: 'NEW',
        pupilAttendance_id: null
      }
    ]
    const targetStatus = pupilStatusAnalysisService.analysePupilData(data)
    expect(targetStatus).toBe('ALLOC')
  })

  it('returns LOGGED_IN for a pupil with a check in COLLECTED state', () => {
    const data = [
      {
        pupil_id: 12,
        pupilStatusCode: 'ALLOC',
        check_id: 1,
        checkStatusCode: 'COL',
        pupilAttendance_id: null
      }
    ]
    const targetStatus = pupilStatusAnalysisService.analysePupilData(data)
    expect(targetStatus).toBe('LOGGED_IN')
  })

  it('returns STARTED for a pupil with a check in STARTED state', () => {
    const data = [
      {
        pupil_id: 12,
        pupilStatusCode: 'LOGGED_IN',
        check_id: 1,
        checkStatusCode: 'STD',
        pupilAttendance_id: null
      }
    ]
    const targetStatus = pupilStatusAnalysisService.analysePupilData(data)
    expect(targetStatus).toBe('STARTED')
  })

  it('returns COMPLETED for a pupil with a check in COMPLETED state', () => {
    const data = [
      {
        pupil_id: 12,
        pupilStatusCode: 'STARTED',
        check_id: 1,
        checkStatusCode: 'CMP',
        pupilAttendance_id: null
      }
    ]
    const targetStatus = pupilStatusAnalysisService.analysePupilData(data)
    expect(targetStatus).toBe('COMPLETED')
  })

  it('returns NOT_TAKING for a pupil who is marked as not taking the check', () => {
    const data = [
      {
        pupil_id: 12,
        pupilStatusCode: 'UNALLOC',
        check_id: 2,
        checkStatusCode: 'CMP',
        pupilAttendance_id: 1
      }
    ]
    const targetStatus = pupilStatusAnalysisService.analysePupilData(data)
    expect(targetStatus).toBe('NOT_TAKING')
  })

  it('returns UNALLOC for a pupil who has been given a check that subsequently expired', () => {
    const data = [
      {
        pupil_id: 12,
        pupilStatusCode: 'ALLOC',
        check_id: 2,
        checkStatusCode: 'EXP',
        pupilAttendance_id: null
      }
    ]
    const targetStatus = pupilStatusAnalysisService.analysePupilData(data)
    expect(targetStatus).toBe('UNALLOC')
  })

  it('returns UNALLOC by default', () => {
    const data = [
      {
        pupil_id: 12,
        pupilStatusCode: 'UNALLOC',
        check_id: null,
        checkStatusCode: 'SOMETHING_RANDOM',
        pupilAttendance_id: null
      }
    ]
    const targetStatus = pupilStatusAnalysisService.analysePupilData(data)
    expect(targetStatus).toBe('UNALLOC')
  })
})
