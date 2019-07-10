'use strict'

/* global describe it expect spyOn beforeEach fail */

const roleService = require('../../../services/role.service')
const MtcSchoolMismatchError = require('../../../error-types/mtc-school-mismatch.error')

describe('role.service', () => {
  describe('mapNcaRoleToMtcRole', () => {
    it('correctly maps all known roles', () => {
      expect(roleService.mapNcaRoleToMtcRole('SuperAdmin')).toBe('SERVICE-MANAGER')
      expect(roleService.mapNcaRoleToMtcRole('SuperAdmin', 9991234)).toBe('TEACHER')
      expect(roleService.mapNcaRoleToMtcRole('SuperUser')).toBe('HEADTEACHER')
      expect(roleService.mapNcaRoleToMtcRole('SchoolSup')).toBe('TEACHER')
      expect(roleService.mapNcaRoleToMtcRole('SchoolNom')).toBe('TEACHER')
      expect(roleService.mapNcaRoleToMtcRole('Admin', 9991234)).toBe('TEACHER')
      expect(roleService.mapNcaRoleToMtcRole('DataAdmin')).toBe('TEST-DEVELOPER')
      expect(roleService.mapNcaRoleToMtcRole('SchoolNomAAMTC')).toBe('TEACHER')
    })

    it('throws an exception if the ncaUserType does not map to a known role', () => {
      expect(function () { roleService.mapNcaRoleToMtcRole('Batman') }).toThrowError('Unknown ncaUserType Batman')
    })
    it('throws an MtcHelpdeskImpersonation type error if the school dfeNumber is not provided for the helpdesk user', () => {
      try {
        roleService.mapNcaRoleToMtcRole('AdminAA')
        fail()
      } catch (error) {
        expect(error instanceof MtcSchoolMismatchError).toBeTruthy()
        expect(error.name).toBe('MtcSchoolMismatchError')
        expect(error.message).toEqual('No school is found with the given dfe number')
        expect(error.userMessage).toEqual('The school is not found in the MTC database')
      }
    })
  })

  describe('findByName', () => {
    let roleDataService
    beforeEach(() => {
      roleDataService = require('../../../services/data-access/role.data.service')
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
