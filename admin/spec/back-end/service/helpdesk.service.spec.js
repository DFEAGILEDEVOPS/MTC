'use strict'

const helpdeskService = require('../../../services/helpdesk.service')

describe('helpdeskService', () => {
  describe('isHelpdeskRole', () => {
    test('should return false if user is not a helpdesk', () => {
      const user = { role: 'TEACHER' }
      expect(helpdeskService.isHelpdeskRole(user)).toBeFalsy()
    })
    test('should return true if user is a helpdesk', () => {
      const user = { role: 'HELPDESK' }
      expect(helpdeskService.isHelpdeskRole(user)).toBeTruthy()
    })
  })
  describe('isImpersonating', () => {
    test('should return false if user is missing impersonation attributes', () => {
      const user = {
        School: undefined,
        schoolId: undefined,
        timezone: undefined
      }
      expect(helpdeskService.isImpersonating(user)).toBeFalsy()
    })
    test('should return true if the user has impersonation attributes', () => {
      const user = {
        role: 'HELPDESK',
        School: 9990000,
        schoolId: 1,
        timezone: ''
      }
      expect(helpdeskService.isImpersonating(user)).toBeTruthy()
    })
  })
})
