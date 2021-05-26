'use strict'

/* global describe it expect spyOn beforeEach test */
const roles = require('../../../lib/consts/roles')
const roleService = require('../../../services/role.service')

describe('role.service', () => {
  describe('findByTitle', () => {
    let roleDataService
    beforeEach(() => {
      roleDataService = require('../../../services/data-access/role.data.service')
    })
    it('throws an error when name not provided', async () => {
      spyOn(roleDataService, 'sqlFindOneByTitle')
      try {
        await roleService.findByTitle(undefined)
        expect('error').toBe('to have been thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBe('roleTitle is required')
      }
    })

    it('returns entry provided by data service', async () => {
      const serviceManagerRoleName = roles.serviceManager
      spyOn(roleDataService, 'sqlFindOneByTitle').and.returnValue(Promise.resolve({ id: 1, name: serviceManagerRoleName }))
      const actual = await roleService.findByTitle('a role that returns service manager')
      expect(actual).toBeDefined()
      expect(actual.id).toBe(1)
      expect(actual.name).toBe(serviceManagerRoleName)
    })
  })

  describe('#mapDfeRoleToMtcRole', () => {
    test('it maps SERVICE-MANAGER for Dfe Role mtc_service_manager', () => {
      expect(roleService.mapDfeRoleToMtcRole('mtc_service_manager')).toBe('SERVICE-MANAGER')
    })

    test('it maps TEACHER for Dfe Role mtc_headteacher', () => {
      expect(roleService.mapDfeRoleToMtcRole('mtc_headteacher')).toBe('TEACHER')
    })

    test('it maps TEACHER for Dfe Role teacher', () => {
      expect(roleService.mapDfeRoleToMtcRole('mtc_teacher')).toBe('TEACHER')
    })

    test('it maps HELPDESK for Dfe Role mtc_helpdesk', () => {
      expect(roleService.mapDfeRoleToMtcRole('mtc_helpdesk')).toBe('HELPDESK')
    })

    test('it maps TEST-DEVELOPER for Dfe Role mtc_test_developer', () => {
      expect(roleService.mapDfeRoleToMtcRole('mtc_tech_support')).toBe('TECH-SUPPORT')
    })

    test('it maps TECH-SUPPORT for Dfe Role mtc_tech_spport', () => {
      expect(roleService.mapDfeRoleToMtcRole('mtc_tech_support')).toBe('TECH-SUPPORT')
    })

    test('it maps STA-ADMIN for Dfe Role mtc_staadmin', () => {
      expect(roleService.mapDfeRoleToMtcRole('mtc_staadmin')).toBe('STA-ADMIN')
    })

    test('unknown DfE roles raise an exception', () => {
      expect(function () { roleService.mapDfeRoleToMtcRole('__unknown__') }).toThrowError(/^Unknown dfe role/)
    })
  })
})
