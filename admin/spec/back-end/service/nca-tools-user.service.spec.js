'use strict'

/* global describe, it, spyOn, expect, fail, beforeEach */
let ncaToolsUserService, schoolDataService, userDataService, roleService

describe('nca-tools-user.service', () => {
  describe('mapNcaUserToMtcUser', () => {
    beforeEach(() => {
      ncaToolsUserService = require('../../../services/nca-tools-user.service')
      schoolDataService = require('../../../services/data-access/school.data.service')
      userDataService = require('../../../services/data-access/user.data.service')
      roleService = require('../../../services/role.service')
    })
    it('throws an error if ncaUser argument is missing', async (done) => {
      try {
        await ncaToolsUserService.mapNcaUserToMtcUser(undefined)
        fail('expected error to be thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBe('ncaUser argument required')
        done()
      }
    })
    it('throws an error if assigned school does not exist', async (done) => {
      spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue(Promise.resolve())
      const ncaDfeNumber = 999
      try {
        await ncaToolsUserService.mapNcaUserToMtcUser({ School: ncaDfeNumber })
        fail('expected error to be thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBe(`Unknown School:${ncaDfeNumber}`)
        done()
      }
    })

    it('creates a user entry if one does not exist', async (done) => {
      spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue(Promise.resolve({ id: 1 }))
      spyOn(userDataService, 'sqlFindOneByIdentifier').and.returnValues(
        Promise.resolve(undefined),
        Promise.resolve({ school_id: 1 })
      )
      spyOn(roleService, 'findByTitle').and.returnValue(Promise.resolve({ id: 1 }))
      spyOn(userDataService, 'sqlCreate').and.returnValue(Promise.resolve())
      await ncaToolsUserService.mapNcaUserToMtcUser({
        School: 999999,
        UserType: 'SchoolNom',
        UserName: 'robin'
      })
      expect(userDataService.sqlCreate).toHaveBeenCalled()
      done()
    })

    it('throws an error if it cannot find created user', async (done) => {
      spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue(Promise.resolve({ id: 1 }))
      spyOn(userDataService, 'sqlFindOneByIdentifier').and.returnValues(
        Promise.resolve(),
        Promise.resolve()
      )
      spyOn(roleService, 'findByTitle').and.returnValue(Promise.resolve({ id: 1 }))
      spyOn(userDataService, 'sqlCreate').and.returnValue(Promise.resolve())
      try {
        await ncaToolsUserService.mapNcaUserToMtcUser({
          School: 999999,
          UserType: 'SchoolNom',
          UserName: 'robin'
        })
        fail('expected error to be thrown')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBe('unable to find user record')
        done()
      }
    })

    it('updates user school if different to current one', async (done) => {
      spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue(Promise.resolve({ id: 1 }))
      spyOn(userDataService, 'sqlFindOneByIdentifier').and.returnValue(Promise.resolve({ school_id: 999 }))
      spyOn(userDataService, 'sqlUpdateSchool').and.returnValue(Promise.resolve())
      spyOn(roleService, 'findByTitle').and.returnValue(Promise.resolve({ id: 1 }))
      spyOn(userDataService, 'sqlCreate').and.returnValue(Promise.resolve())
      await ncaToolsUserService.mapNcaUserToMtcUser({
        School: 999999,
        UserType: 'SchoolNom',
        UserName: 'robin'
      })
      expect(userDataService.sqlUpdateSchool).toHaveBeenCalled()
      done()
    })

    it('maps role title to user object before it is returned', async (done) => {
      spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue(Promise.resolve({ id: 1 }))
      spyOn(userDataService, 'sqlFindOneByIdentifier').and.returnValue(Promise.resolve({ school_id: 999 }))
      spyOn(userDataService, 'sqlUpdateSchool').and.returnValue(Promise.resolve())
      spyOn(roleService, 'findByTitle').and.returnValue(Promise.resolve({ id: 1 }))
      spyOn(userDataService, 'sqlCreate').and.returnValue(Promise.resolve())
      const user = await ncaToolsUserService.mapNcaUserToMtcUser({
        School: 999999,
        UserType: 'SchoolNom',
        UserName: 'robin'
      })
      expect(user).toBeDefined()
      expect(user.mtcRole).toBe('TEACHER')
      done()
    })

    it('does not look up school if not provided', async () => {
      spyOn(schoolDataService, 'sqlFindOneByDfeNumber')
      spyOn(userDataService, 'sqlFindOneByIdentifier').and.returnValue(Promise.resolve({ school_id: null }))
      spyOn(userDataService, 'sqlUpdateSchool')
      spyOn(roleService, 'findByTitle').and.returnValue(Promise.resolve({ id: 1 }))
      spyOn(userDataService, 'sqlCreate').and.returnValue(Promise.resolve())
      await ncaToolsUserService.mapNcaUserToMtcUser({UserType: 'SchoolNom'})
      expect(schoolDataService.sqlFindOneByDfeNumber).not.toHaveBeenCalled()
      expect(userDataService.sqlUpdateSchool).not.toHaveBeenCalled()
    })
  })
})
