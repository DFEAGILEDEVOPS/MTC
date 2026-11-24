'use strict'

const helpdeskService = require('../../../services/helpdesk.service')
const roles = require('../../../lib/consts/roles')

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
    describe('isStaAdmin', () => {
      test('should return true for STA-ADMIN users', () => {
        expect(helpdeskService.isStaAdmin({ role: roles.staAdmin })).toBeTruthy()
      })
      test('should return true for SUPERUSER users', () => {
        expect(helpdeskService.isStaAdmin({ role: roles.superUser })).toBeTruthy()
      })
    })
  })
})
