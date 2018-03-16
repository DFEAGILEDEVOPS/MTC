'use strict'

/* global describe it expect spyOn beforeEach */

const roleService = require('../../services/role.service')

describe('role.service', () => {
  describe('mapNcaRoleToMtcRole', () => {
    it('default to teacher when nca tools user type is not found', () => {
      const actual = roleService.mapNcaRoleToMtcRole('batman')
      expect(actual).toBe('TEACHER')
    })

    it('correctly maps all known roles', () => {
      expect(roleService.mapNcaRoleToMtcRole('SuperAdmin')).toBe('SERVICE-MANAGER')
      expect(roleService.mapNcaRoleToMtcRole('SuperAdmin', 9991234)).toBe('TEACHER')
      expect(roleService.mapNcaRoleToMtcRole('SuperUser')).toBe('HEADTEACHER')
      expect(roleService.mapNcaRoleToMtcRole('SchoolSup')).toBe('TEACHER')
      expect(roleService.mapNcaRoleToMtcRole('SchoolNom')).toBe('TEACHER')
      expect(roleService.mapNcaRoleToMtcRole('Admin', 9991234)).toBe('TEACHER')
      expect(roleService.mapNcaRoleToMtcRole('DataAdmin')).toBe('TEST-DEVELOPER')
    })
  })

  describe('findByName', () => {
    let roleDataService
    beforeEach(() => {
      roleDataService = require('../../services/data-access/role.data.service')
    })
    it('throws an error when name not provided', async (done) => {
      spyOn(roleDataService, 'sqlFindOneByTitle')
      try {
        await roleService.findByTitle(undefined)
        expect('error').toBe('to have been thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBe('roleTitle is required')
        done()
      }
    })

    it('returns entry provided by data service', async (done) => {
      const serviceManagerRoleName = 'SERVICE-MANAGER'
      spyOn(roleDataService, 'sqlFindOneByTitle').and.returnValue(Promise.resolve({ id: 1, name: serviceManagerRoleName }))
      const actual = await roleService.findByTitle('a role that returns service manager')
      expect(actual).toBeDefined()
      expect(actual.id).toBe(1)
      expect(actual.name).toBe(serviceManagerRoleName)
      done()
    })
  })
})
