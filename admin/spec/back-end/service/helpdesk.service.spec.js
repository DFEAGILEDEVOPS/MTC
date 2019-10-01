'use strict'

/* global describe, it, expect */
const helpdeskService = require('../../../services/helpdesk.service')

describe('helpdeskService', () => {
  describe('hasHelpdeskNotReceivedImpersonation', () => {
    it('should return false if user is not a helpdesk', () => {
      const user = { role: 'TEACHER' }
      expect(helpdeskService.hasHelpdeskNotReceivedImpersonation(user)).toBeFalsy()
    })
    it('should return false if user is a helpdesk and has impersonation attributes', () => {
      const user = {
        role: 'HELPDESK',
        School: 9990000,
        schoolId: 1,
        timezone: ''
      }
      expect(helpdeskService.hasHelpdeskNotReceivedImpersonation(user)).toBeFalsy()
    })
    it('should return true if user is a helpdesk and is missing impersonation attributes', () => {
      const user = {
        role: 'HELPDESK',
        School: undefined,
        schoolId: undefined,
        timezone: undefined
      }
      expect(helpdeskService.hasHelpdeskNotReceivedImpersonation(user)).toBeTruthy()
    })
  })
})
