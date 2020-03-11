'use strict'

/* global describe it expect spyOn beforeEach */
const roles = require('../../../lib/consts/roles')
const roleService = require('../../../services/role.service')

describe('role.service', () => {
  describe('findByName', () => {
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
})
