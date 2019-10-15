'use strict'

/* global describe, it, spyOn, expect, fail, beforeEach xit */

let sut, schoolDataService, userDataService, roleService, dfeDataService

describe('dfe-signin.service', () => {
  beforeEach(() => {
    sut = require('../../../services/dfe-signin.service')
    schoolDataService = require('../../../services/data-access/school.data.service')
    userDataService = require('../../../services/data-access/user.data.service')
    roleService = require('../../../services/role.service')
    dfeDataService = require('../../../services/data-access/dfe-signin.data.service')
  })
  it('throws an error if dfeUser argument is missing', async (done) => {
    try {
      await sut.initialiseUser(undefined, {})
      fail('expected error to be thrown')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBe('dfeUser argument required')
      done()
    }
  })
  it('throws an error if tokenset argument is missing', async (done) => {
    try {
      await sut.initialiseUser({}, undefined)
      fail('expected error to be thrown')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBe('tokenset argument required')
      done()
    }
  })
  it('throws an error if dfeUser object does not have a defined organisation property', async () => {
    try {
      spyOn(dfeDataService, 'getDfeRole').and.returnValue(Promise.resolve('mtc_teacher'))
      spyOn(roleService, 'findByTitle').and.returnValue(Promise.resolve({ id: 1 }))
      await sut.initialiseUser({ organisation: undefined }, { id_token: 'token' })
      fail('expected error to be thrown')
    } catch (error) {
      expect(error instanceof Error).toBeTruthy()
      expect(error.message).toEqual('user.organisation or user.organisation.urn not found on dfeUser object')
    }
  })
  it('throws an error if dfeUser object does not have a defined organisation.urn property', async () => {
    spyOn(dfeDataService, 'getDfeRole').and.returnValue(Promise.resolve('mtc_teacher'))
    spyOn(roleService, 'findByTitle').and.returnValue(Promise.resolve({ id: 1 }))
    try {
      await sut.initialiseUser({ organisation: { urn: undefined } }, { id_token: 'token' })
      fail('expected error to be thrown')
    } catch (error) {
      expect(error instanceof Error).toBeTruthy()
      expect(error.message).toEqual('user.organisation or user.organisation.urn not found on dfeUser object')
    }
  })

  it('does not look up school if not teacher or headteacher', async () => {
    spyOn(dfeDataService, 'getDfeRole').and.returnValue(Promise.resolve('mtc_test_developer'))
    spyOn(roleService, 'findByTitle').and.returnValue(Promise.resolve({ id: 1 }))
    spyOn(schoolDataService, 'sqlFindOneByUrn')
    spyOn(userDataService, 'sqlFindOneByIdentifier').and.returnValue(Promise.resolve({ school_id: null }))
    spyOn(userDataService, 'sqlUpdateSchool')
    spyOn(userDataService, 'sqlCreate').and.returnValue(Promise.resolve())
    await sut.initialiseUser({ organisation: { urn: 12345 } }, { id_token: 'token' })
    expect(schoolDataService.sqlFindOneByUrn).not.toHaveBeenCalled()
    expect(userDataService.sqlUpdateSchool).not.toHaveBeenCalled()
  })

  it('creates a user entry if one does not exist', async (done) => {
    spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue(Promise.resolve({ id: 1 }))
    spyOn(userDataService, 'sqlFindOneByIdentifier').and.returnValues(
      Promise.resolve(undefined),
      Promise.resolve({ school_id: 1 })
    )
    spyOn(dfeDataService, 'getDfeRole').and.returnValue(Promise.resolve('mtc_test_developer'))
    spyOn(roleService, 'findByTitle').and.returnValue(Promise.resolve({ id: 1 }))
    spyOn(userDataService, 'sqlCreate').and.returnValue(Promise.resolve())
    await sut.initialiseUser({ organisation: { urn: 12345 } }, { id_token: 'token' })
    expect(userDataService.sqlCreate).toHaveBeenCalled()
    done()
  })

  it('throws an error if it cannot find created user', async (done) => {
    spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue(Promise.resolve({ id: 1 }))
    spyOn(userDataService, 'sqlFindOneByIdentifier').and.returnValues(
      Promise.resolve(),
      Promise.resolve()
    )
    spyOn(dfeDataService, 'getDfeRole').and.returnValue(Promise.resolve('mtc_test_developer'))
    spyOn(roleService, 'findByTitle').and.returnValue(Promise.resolve({ id: 1 }))
    spyOn(userDataService, 'sqlCreate').and.returnValue(Promise.resolve())
    try {
      await sut.initialiseUser({ organisation: { urn: 12345 } }, { id_token: 'token' })
      fail('expected error to be thrown')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBe('unable to find user record')
      done()
    }
  })
  // failing WIP
  xit('updates user school if different to current one and refetches the object', async (done) => {
    spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue(Promise.resolve({ id: 1 }))
    spyOn(userDataService, 'sqlFindOneByIdentifier').and.returnValues(
      Promise.resolve({ school_id: 999 }),
      Promise.resolve({ school_id: 998 })
    )
    spyOn(userDataService, 'sqlUpdateSchool').and.returnValue(Promise.resolve())
    spyOn(dfeDataService, 'getDfeRole').and.returnValue(Promise.resolve('mtc_test_developer'))
    spyOn(roleService, 'findByTitle').and.returnValue(Promise.resolve({ id: 1 }))
    spyOn(userDataService, 'sqlCreate').and.returnValue(Promise.resolve())
    const user = await sut.initialiseUser({ organisation: { urn: 12345 } }, { id_token: 'token' })
    expect(userDataService.sqlUpdateSchool).toHaveBeenCalled()
    expect(userDataService.sqlFindOneByIdentifier).toHaveBeenCalled()
    expect(user).toBeDefined()
    expect(user.school_id).toBe(998)
    done()
  })

  xit('maps role title to user object before it is returned', async (done) => {
    spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue(Promise.resolve({ id: 1 }))
    spyOn(userDataService, 'sqlFindOneByIdentifier').and.returnValue(Promise.resolve({ school_id: 999 }))
    spyOn(userDataService, 'sqlUpdateSchool').and.returnValue(Promise.resolve())
    spyOn(roleService, 'findByTitle').and.returnValue(Promise.resolve({ id: 1 }))
    spyOn(userDataService, 'sqlCreate').and.returnValue(Promise.resolve())
    const user = await sut.initialiseUser({
      School: 999999,
      UserType: 'SchoolNom',
      UserName: 'robin'
    }, { id_token: 'token' })
    expect(user).toBeDefined()
    expect(user.mtcRole).toBe('TEACHER')
    done()
  })
})
