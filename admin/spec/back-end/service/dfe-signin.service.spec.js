'use strict'

/* global describe, it, spyOn, expect, fail, beforeEach */

let sut, schoolDataService, userDataService, roleService, dfeDataService
const token = { id_token: 'the-token' }
const config = require('../../../config')

describe('dfe-signin.service', () => {
  beforeEach(() => {
    sut = require('../../../services/dfe-signin.service')
    schoolDataService = require('../../../services/data-access/school.data.service')
    userDataService = require('../../../services/data-access/user.data.service')
    roleService = require('../../../services/role.service')
    dfeDataService = require('../../../services/data-access/dfe-signin.data.service')
  })
  it('throws an error if dfeUser argument is missing', async () => {
    try {
      await sut.initialiseUser(undefined, {})
      fail('expected error to be thrown')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBe('dfeUser argument required')
    }
  })
  it('throws an error if tokenset argument is missing', async () => {
    try {
      await sut.initialiseUser({}, undefined)
      fail('expected error to be thrown')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBe('tokenset argument required')
    }
  })
  it('throws an error if dfeUser object does not have a defined organisation property', async () => {
    try {
      spyOn(dfeDataService, 'getDfeRole').and.returnValue(Promise.resolve('mtc_teacher'))
      spyOn(roleService, 'findByTitle').and.returnValue(Promise.resolve({ id: 1 }))
      await sut.initialiseUser({ organisation: undefined }, token)
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
      await sut.initialiseUser({ organisation: { urn: undefined } }, token)
      fail('expected error to be thrown')
    } catch (error) {
      expect(error instanceof Error).toBeTruthy()
      expect(error.message).toEqual('user.organisation or user.organisation.urn not found on dfeUser object')
    }
  })

  it('does look up school if teacher', async () => {
    spyOn(dfeDataService, 'getDfeRole').and.returnValue(Promise.resolve('mtc_teacher'))
    spyOn(roleService, 'findByTitle').and.returnValue(Promise.resolve({ id: 1 }))
    spyOn(schoolDataService, 'sqlFindOneByUrn').and.returnValue({ id: 1 })
    spyOn(userDataService, 'sqlFindOneByIdentifier').and.returnValue(Promise.resolve({ school_id: null }))
    spyOn(userDataService, 'sqlUpdateSchool')
    spyOn(userDataService, 'sqlCreate').and.returnValue(Promise.resolve())
    await sut.initialiseUser({ organisation: { urn: 12345 } }, token)
    expect(schoolDataService.sqlFindOneByUrn).toHaveBeenCalledWith(12345)
  })

  it('does look up school if headteacher', async () => {
    spyOn(dfeDataService, 'getDfeRole').and.returnValue(Promise.resolve('mtc_headteacher'))
    spyOn(roleService, 'findByTitle').and.returnValue(Promise.resolve({ id: 2 }))
    spyOn(schoolDataService, 'sqlFindOneByUrn').and.returnValue({ id: 1 })
    spyOn(userDataService, 'sqlFindOneByIdentifier').and.returnValue(Promise.resolve({ school_id: null }))
    spyOn(userDataService, 'sqlUpdateSchool')
    spyOn(userDataService, 'sqlCreate').and.returnValue(Promise.resolve())
    await sut.initialiseUser({ organisation: { urn: 123 } }, token)
    expect(schoolDataService.sqlFindOneByUrn).toHaveBeenCalledWith(123)
  })

  it('does not look up school if not teacher or headteacher', async () => {
    spyOn(dfeDataService, 'getDfeRole').and.returnValue(Promise.resolve('mtc_test_developer'))
    spyOn(roleService, 'findByTitle').and.returnValue(Promise.resolve({ id: 1 }))
    spyOn(schoolDataService, 'sqlFindOneByUrn').and.returnValue({ id: 1 })
    spyOn(userDataService, 'sqlFindOneByIdentifier').and.returnValue(Promise.resolve({ school_id: null }))
    spyOn(userDataService, 'sqlUpdateSchool')
    spyOn(userDataService, 'sqlCreate').and.returnValue(Promise.resolve())
    await sut.initialiseUser({}, token)
    expect(schoolDataService.sqlFindOneByUrn).not.toHaveBeenCalled()
  })

  it('creates a user entry if one does not exist', async () => {
    spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue(Promise.resolve({ id: 1 }))
    spyOn(userDataService, 'sqlFindOneByIdentifier').and.returnValues(
      Promise.resolve(undefined),
      Promise.resolve({ school_id: 1 })
    )
    spyOn(dfeDataService, 'getDfeRole').and.returnValue(Promise.resolve('mtc_test_developer'))
    spyOn(roleService, 'findByTitle').and.returnValue(Promise.resolve({ id: 1 }))
    spyOn(userDataService, 'sqlCreate').and.returnValue(Promise.resolve())
    await sut.initialiseUser({ organisation: { urn: 12345 } }, token)
    expect(userDataService.sqlCreate).toHaveBeenCalled()
  })

  it('throws an error if it cannot find created user', async () => {
    spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue(Promise.resolve({ id: 1 }))
    spyOn(userDataService, 'sqlFindOneByIdentifier').and.returnValues(
      Promise.resolve(),
      Promise.resolve()
    )
    spyOn(dfeDataService, 'getDfeRole').and.returnValue(Promise.resolve('mtc_test_developer'))
    spyOn(roleService, 'findByTitle').and.returnValue(Promise.resolve({ id: 1 }))
    spyOn(userDataService, 'sqlCreate').and.returnValue(Promise.resolve())
    try {
      await sut.initialiseUser({ organisation: { urn: 12345 } }, token)
      fail('expected error to be thrown')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBe('unable to find user record')
    }
  })

  it('updates user school if different to current one and refetches the object', async () => {
    spyOn(schoolDataService, 'sqlFindOneByUrn').and.returnValue(Promise.resolve({ id: 1 }))
    spyOn(userDataService, 'sqlFindOneByIdentifier').and.returnValues(
      Promise.resolve({ school_id: 999 }),
      Promise.resolve({ school_id: 998 })
    )
    spyOn(userDataService, 'sqlUpdateSchool').and.returnValue(Promise.resolve())
    spyOn(dfeDataService, 'getDfeRole').and.returnValue(Promise.resolve('mtc_teacher'))
    spyOn(roleService, 'findByTitle').and.returnValue(Promise.resolve({ id: 1 }))
    spyOn(userDataService, 'sqlCreate').and.returnValue(Promise.resolve())
    const user = await sut.initialiseUser({ organisation: { urn: 12345 } }, token)
    expect(userDataService.sqlUpdateSchool).toHaveBeenCalled()
    expect(userDataService.sqlFindOneByIdentifier).toHaveBeenCalled()
    expect(user).toBeDefined()
    expect(user.school_id).toBe(998)
  })

  it('maps role title to user object before it is returned', async () => {
    spyOn(schoolDataService, 'sqlFindOneByUrn').and.returnValue(Promise.resolve({ id: 1 }))
    spyOn(userDataService, 'sqlFindOneByIdentifier').and.returnValue(Promise.resolve({ school_id: 999 }))
    spyOn(dfeDataService, 'getDfeRole').and.returnValue(Promise.resolve('mtc_teacher'))
    spyOn(userDataService, 'sqlUpdateSchool').and.returnValue(Promise.resolve())
    spyOn(roleService, 'findByTitle').and.returnValue(Promise.resolve({ id: 1 }))
    spyOn(userDataService, 'sqlCreate').and.returnValue(Promise.resolve())
    const user = await sut.initialiseUser({ organisation: { urn: 12345 } }, token)
    expect(user).toBeDefined()
    expect(user.role).toBe('TEACHER')
  })

  it('displayName is constructed from given name family name and email', async () => {
    spyOn(schoolDataService, 'sqlFindOneByUrn').and.returnValue(Promise.resolve({ id: 1 }))
    spyOn(userDataService, 'sqlFindOneByIdentifier').and.returnValue(Promise.resolve({ school_id: 999 }))
    spyOn(dfeDataService, 'getDfeRole').and.returnValue(Promise.resolve('mtc_test_developer'))
    spyOn(userDataService, 'sqlUpdateSchool').and.returnValue(Promise.resolve())
    spyOn(roleService, 'findByTitle').and.returnValue(Promise.resolve({ id: 1 }))
    spyOn(userDataService, 'sqlCreate').and.returnValue(Promise.resolve())
    const firstName = 'chuckie'
    const lastName = 'egg'
    const email = 'ralph@codemasters.com'
    const user = await sut.initialiseUser({ given_name: firstName, family_name: lastName, email: email }, token)
    expect(user).toBeDefined()
    expect(user.displayName).toBe(`${firstName} ${lastName} (${email})`)
  })

  it('id_token is set on user from token object', async () => {
    spyOn(schoolDataService, 'sqlFindOneByUrn').and.returnValue(Promise.resolve({ id: 1 }))
    spyOn(userDataService, 'sqlFindOneByIdentifier').and.returnValue(Promise.resolve({ school_id: 999 }))
    spyOn(dfeDataService, 'getDfeRole').and.returnValue(Promise.resolve('mtc_test_developer'))
    spyOn(userDataService, 'sqlUpdateSchool').and.returnValue(Promise.resolve())
    spyOn(roleService, 'findByTitle').and.returnValue(Promise.resolve({ id: 1 }))
    spyOn(userDataService, 'sqlCreate').and.returnValue(Promise.resolve())
    const user = await sut.initialiseUser({ }, token)
    expect(user).toBeDefined()
    expect(user.id_token).toBeDefined()
    expect(user.id_token).toBe(token.id_token)
  })

  it('dfeNumber and schoolId are set on user from school record', async () => {
    spyOn(schoolDataService, 'sqlFindOneByUrn').and.returnValue(Promise.resolve({ id: 123, dfeNumber: 567 }))
    spyOn(userDataService, 'sqlFindOneByIdentifier').and.returnValue(Promise.resolve({ school_id: 999 }))
    spyOn(dfeDataService, 'getDfeRole').and.returnValue(Promise.resolve('mtc_teacher'))
    spyOn(userDataService, 'sqlUpdateSchool').and.returnValue(Promise.resolve())
    spyOn(roleService, 'findByTitle').and.returnValue(Promise.resolve({ id: 1 }))
    spyOn(userDataService, 'sqlCreate').and.returnValue(Promise.resolve())
    const user = await sut.initialiseUser({ organisation: { urn: 12345 } }, token)
    expect(user).toBeDefined()
    expect(user.School).toBeDefined()
    expect(user.School).toBe(567)
    expect(user.schoolId).toBeDefined()
    expect(user.schoolId).toBe(123)
  })

  it('sets timezone to assigned school timezone when provided', async () => {
    spyOn(schoolDataService, 'sqlFindOneByUrn').and.returnValue(
      Promise.resolve({ id: 123, dfeNumber: 567, timezone: 'the timezone' }))
    spyOn(userDataService, 'sqlFindOneByIdentifier').and.returnValue(Promise.resolve({ school_id: 999 }))
    spyOn(dfeDataService, 'getDfeRole').and.returnValue(Promise.resolve('mtc_teacher'))
    spyOn(userDataService, 'sqlUpdateSchool').and.returnValue(Promise.resolve())
    spyOn(roleService, 'findByTitle').and.returnValue(Promise.resolve({ id: 1 }))
    spyOn(userDataService, 'sqlCreate').and.returnValue(Promise.resolve())
    const user = await sut.initialiseUser({ organisation: { urn: 12345 } }, token)
    expect(user).toBeDefined()
    expect(user.timezone).toBeDefined()
    expect(user.timezone).toBe('the timezone')
  })

  it('sets timezone to system default when no schoo timezone is set', async () => {
    spyOn(schoolDataService, 'sqlFindOneByUrn').and.returnValue(
      Promise.resolve({ id: 123, dfeNumber: 567, timezone: undefined }))
    spyOn(userDataService, 'sqlFindOneByIdentifier').and.returnValue(Promise.resolve({ school_id: 999 }))
    spyOn(dfeDataService, 'getDfeRole').and.returnValue(Promise.resolve('mtc_teacher'))
    spyOn(userDataService, 'sqlUpdateSchool').and.returnValue(Promise.resolve())
    spyOn(roleService, 'findByTitle').and.returnValue(Promise.resolve({ id: 1 }))
    spyOn(userDataService, 'sqlCreate').and.returnValue(Promise.resolve())
    const user = await sut.initialiseUser({ organisation: { urn: 12345 } }, token)
    expect(user).toBeDefined()
    expect(user.timezone).toBeDefined()
    expect(user.timezone).toBe(config.DEFAULT_TIMEZONE)
  })

  it('sets externalUserId to the provided user id and id to the user record id', async () => {
    spyOn(schoolDataService, 'sqlFindOneByUrn').and.returnValue(
      Promise.resolve({ id: 123, dfeNumber: 567, timezone: undefined }))
    spyOn(userDataService, 'sqlFindOneByIdentifier').and.returnValue(Promise.resolve({ school_id: 999, id: 567 }))
    spyOn(dfeDataService, 'getDfeRole').and.returnValue(Promise.resolve('mtc_teacher'))
    spyOn(userDataService, 'sqlUpdateSchool').and.returnValue(Promise.resolve())
    spyOn(roleService, 'findByTitle').and.returnValue(Promise.resolve({ id: 1 }))
    spyOn(userDataService, 'sqlCreate').and.returnValue(Promise.resolve())
    const user = await sut.initialiseUser({ organisation: { urn: 12345 }, sub: 'external-user-id' }, token)
    expect(user).toBeDefined()
    expect(user.providerUserId).toBe('external-user-id')
    expect(user.id).toBe(567)
  })
})
