'use strict'

let sut, schoolDataService, userDataService, roleService, dfeDataService, adminLogonEventDataService
const token = { id_token: 'the-token' }
const config = require('../../../config')
const roles = require('../../../lib/consts/roles')
const checkWindowPhaseConsts = require('../../../lib/consts/check-window-phase')

describe('dfe-signin.service', () => {
  beforeEach(() => {
    sut = require('../../../services/dfe-signin.service')
    schoolDataService = require('../../../services/data-access/school.data.service')
    userDataService = require('../../../services/data-access/user.data.service')
    roleService = require('../../../services/role.service')
    dfeDataService = require('../../../services/data-access/dfe-signin.data.service')
    adminLogonEventDataService = require('../../../services/data-access/admin-logon-event.data.service')
    global.checkWindowPhase = checkWindowPhaseConsts.officialCheck
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('throws an error if dfeUser argument is missing', async () => {
    await expect(sut.initialiseUser(undefined, {}))
      .rejects
      .toThrowError('dfeUser argument required')
  })
  test('throws an error if tokenset argument is missing', async () => {
    await expect(sut.initialiseUser({}, undefined))
      .rejects
      .toThrowError('tokenset argument required')
  })
  test('throws an error if dfeUser object does not have a defined organisation property', async () => {
    jest.spyOn(dfeDataService, 'getDfeRole').mockResolvedValue('mtc_teacher')
    jest.spyOn(roleService, 'findByTitle').mockResolvedValue({ id: 3, title: roles.teacher })
    const dfeSignInUser = {
      organisation: undefined,
      sub: 'mock-user-id'
    }
    const expectedErrorMessage = `User ${dfeSignInUser.sub} has no organisation data`
    await expect(sut.initialiseUser(dfeSignInUser, token))
      .rejects
      .toThrow(expectedErrorMessage)
  })
  test('throws an error if dfeUser object does not have a defined organisation.urn property', async () => {
    jest.spyOn(dfeDataService, 'getDfeRole').mockResolvedValue('mtc_teacher')
    jest.spyOn(roleService, 'findByTitle').mockResolvedValue({ id: 3, title: roles.teacher })
    const dfeSignInUser = {
      organisation: undefined,
      sub: 'mock-user-id'
    }
    const expectedErrorMessage = `User ${dfeSignInUser.sub} has no organisation data`
    await expect(sut.initialiseUser(dfeSignInUser, token))
      .rejects
      .toThrowError(expectedErrorMessage)
  })

  test('throws system unavailable error if teacher logging on when system is not available', async () => {
    jest.spyOn(dfeDataService, 'getDfeRole').mockResolvedValue('mtc_teacher')
    jest.spyOn(roleService, 'findByTitle').mockResolvedValue({ id: 3, title: roles.teacher })
    global.checkWindowPhase = checkWindowPhaseConsts.unavailable
    await expect(sut.initialiseUser({ organisation: { urn: 12345 } }, token)).rejects.toThrowError('The system is unavailable at this time')
  })

  test('does look up school if role is teacher', async () => {
    jest.spyOn(dfeDataService, 'getDfeRole').mockResolvedValue('mtc_teacher')
    jest.spyOn(roleService, 'findByTitle').mockResolvedValue({ id: 3, title: roles.teacher })
    jest.spyOn(schoolDataService, 'sqlFindOneByUrn').mockResolvedValue({ id: 1 })
    jest.spyOn(userDataService, 'sqlFindOneByIdentifier').mockResolvedValue({ school_id: null, roleTitle: roles.teacher })
    jest.spyOn(userDataService, 'sqlUpdateSchool').mockImplementation()
    jest.spyOn(userDataService, 'sqlCreate').mockImplementation()
    jest.spyOn(adminLogonEventDataService, 'sqlCreate').mockImplementation()
    await sut.initialiseUser({ organisation: { urn: 12345 } }, token)
    expect(schoolDataService.sqlFindOneByUrn).toHaveBeenCalledWith(12345)
  })

  test('does look up school if role is headteacher', async () => {
    jest.spyOn(dfeDataService, 'getDfeRole').mockResolvedValue('mtc_headteacher')
    jest.spyOn(roleService, 'findByTitle').mockResolvedValue({ id: 3, title: roles.teacher })
    jest.spyOn(schoolDataService, 'sqlFindOneByUrn').mockResolvedValue({ id: 1 })
    jest.spyOn(userDataService, 'sqlFindOneByIdentifier').mockResolvedValue({ school_id: null, roleTitle: roles.teacher })
    jest.spyOn(userDataService, 'sqlUpdateSchool').mockImplementation()
    jest.spyOn(userDataService, 'sqlCreate').mockImplementation()
    jest.spyOn(adminLogonEventDataService, 'sqlCreate').mockResolvedValue()
    await sut.initialiseUser({ organisation: { urn: 123 } }, token)
    expect(schoolDataService.sqlFindOneByUrn).toHaveBeenCalledWith(123)
  })

  test('does not look up school if role is not teacher or headteacher', async () => {
    jest.spyOn(dfeDataService, 'getDfeRole').mockResolvedValue('mtc_test_developer')
    jest.spyOn(roleService, 'findByTitle').mockResolvedValue({ id: 2, title: roles.testDeveloper })
    jest.spyOn(schoolDataService, 'sqlFindOneByUrn').mockResolvedValue({ id: 1 })
    jest.spyOn(userDataService, 'sqlFindOneByIdentifier').mockResolvedValue({ school_id: null, roleTitle: roles.testDeveloper })
    jest.spyOn(userDataService, 'sqlUpdateSchool').mockImplementation()
    jest.spyOn(userDataService, 'sqlCreate').mockImplementation()
    jest.spyOn(adminLogonEventDataService, 'sqlCreate').mockImplementation()
    await sut.initialiseUser({}, token)
    expect(schoolDataService.sqlFindOneByUrn).not.toHaveBeenCalled()
  })

  test('creates a user entry if one does not exist', async () => {
    jest.spyOn(schoolDataService, 'sqlFindOneByDfeNumber').mockResolvedValue({ id: 1 })
    jest.spyOn(userDataService, 'sqlFindOneByIdentifier')
      .mockResolvedValueOnce(undefined) // first call to see if it exists
      .mockResolvedValueOnce({ school_id: 1, roleTitle: roles.testDeveloper }) // second call to retrieve the created record
    jest.spyOn(dfeDataService, 'getDfeRole').mockResolvedValue('mtc_test_developer')
    jest.spyOn(roleService, 'findByTitle').mockResolvedValue({ id: 2, title: roles.testDeveloper })
    jest.spyOn(userDataService, 'sqlCreate').mockImplementation()
    jest.spyOn(adminLogonEventDataService, 'sqlCreate').mockImplementation()
    await sut.initialiseUser({ organisation: { urn: 12345 } }, token)
    expect(userDataService.sqlCreate).toHaveBeenCalled()
  })

  test('throws an error if it cannot find created user', async () => {
    jest.spyOn(schoolDataService, 'sqlFindOneByDfeNumber').mockResolvedValue({ id: 1 })
    jest.spyOn(userDataService, 'sqlFindOneByIdentifier')
      .mockResolvedValueOnce()
      .mockResolvedValueOnce()
    jest.spyOn(dfeDataService, 'getDfeRole').mockResolvedValue('mtc_test_developer')
    jest.spyOn(roleService, 'findByTitle').mockResolvedValue({ id: 2, title: roles.testDeveloper })
    jest.spyOn(userDataService, 'sqlCreate').mockResolvedValue()
    await expect(sut.initialiseUser({ organisation: { urn: 12345 } }, token))
      .rejects
      .toThrowError('unable to find user record')
  })

  test('updates user school if different to current one and refetches the object', async () => {
    jest.spyOn(schoolDataService, 'sqlFindOneByUrn').mockResolvedValue({ id: 1 })
    jest.spyOn(userDataService, 'sqlFindOneByIdentifier')
      .mockResolvedValueOnce({ school_id: 999, roleTitle: roles.teacher })
      .mockResolvedValueOnce({ school_id: 998, roleTitle: roles.teacher })
    jest.spyOn(userDataService, 'sqlUpdateSchool').mockImplementation()
    jest.spyOn(dfeDataService, 'getDfeRole').mockResolvedValue('mtc_teacher')
    jest.spyOn(roleService, 'findByTitle').mockResolvedValue({ id: 3, title: roles.teacher })
    jest.spyOn(userDataService, 'sqlCreate').mockImplementation()
    jest.spyOn(adminLogonEventDataService, 'sqlCreate').mockImplementation()
    const user = await sut.initialiseUser({ organisation: { urn: 12345 } }, token)
    expect(userDataService.sqlUpdateSchool).toHaveBeenCalled()
    expect(userDataService.sqlFindOneByIdentifier).toHaveBeenCalled()
    expect(user).toBeDefined()
    expect(user.school_id).toBe(998)
  })

  test('maps role title to user object before it is returned', async () => {
    jest.spyOn(schoolDataService, 'sqlFindOneByUrn').mockResolvedValue({ id: 1 })
    jest.spyOn(userDataService, 'sqlFindOneByIdentifier').mockResolvedValue({ school_id: 999, roleTitle: roles.teacher })
    jest.spyOn(dfeDataService, 'getDfeRole').mockResolvedValue('mtc_teacher')
    jest.spyOn(userDataService, 'sqlUpdateSchool').mockImplementation()
    jest.spyOn(roleService, 'findByTitle').mockResolvedValue({ id: 3, title: roles.teacher })
    jest.spyOn(userDataService, 'sqlCreate').mockImplementation()
    jest.spyOn(adminLogonEventDataService, 'sqlCreate').mockImplementation()
    const user = await sut.initialiseUser({ organisation: { urn: 12345 } }, token)
    expect(user).toBeDefined()
    expect(user.role).toBe(roles.teacher)
  })

  test('displayName is constructed from given name family name and email', async () => {
    jest.spyOn(schoolDataService, 'sqlFindOneByUrn').mockResolvedValue({ id: 1 })
    jest.spyOn(userDataService, 'sqlFindOneByIdentifier').mockResolvedValue({ school_id: 999, roleTitle: roles.testDeveloper })
    jest.spyOn(dfeDataService, 'getDfeRole').mockResolvedValue('mtc_test_developer')
    jest.spyOn(userDataService, 'sqlUpdateSchool').mockImplementation()
    jest.spyOn(roleService, 'findByTitle').mockResolvedValue({ id: 2, title: roles.testDeveloper })
    jest.spyOn(userDataService, 'sqlCreate').mockImplementation()
    const firstName = 'chuckie'
    const lastName = 'egg'
    const email = 'ralph@codemasters.com'
    jest.spyOn(adminLogonEventDataService, 'sqlCreate').mockImplementation()
    const user = await sut.initialiseUser({ given_name: firstName, family_name: lastName, email }, token)
    expect(user).toBeDefined()
    expect(user.displayName).toBe(`${firstName} ${lastName} (${email})`)
  })

  test('id_token is set on user from token object', async () => {
    jest.spyOn(schoolDataService, 'sqlFindOneByUrn').mockResolvedValue({ id: 1 })
    jest.spyOn(userDataService, 'sqlFindOneByIdentifier').mockResolvedValue({ school_id: 999, roleTitle: roles.testDeveloper })
    jest.spyOn(dfeDataService, 'getDfeRole').mockResolvedValue('mtc_test_developer')
    jest.spyOn(userDataService, 'sqlUpdateSchool').mockImplementation()
    jest.spyOn(roleService, 'findByTitle').mockResolvedValue({ id: 2, title: roles.testDeveloper })
    jest.spyOn(userDataService, 'sqlCreate').mockImplementation()
    jest.spyOn(adminLogonEventDataService, 'sqlCreate').mockImplementation()
    const user = await sut.initialiseUser({ }, token)
    expect(user).toBeDefined()
    expect(user.id_token).toBeDefined()
    expect(user.id_token).toBe(token.id_token)
  })

  test('dfeNumber and schoolId are set on user from school record', async () => {
    jest.spyOn(schoolDataService, 'sqlFindOneByUrn').mockResolvedValue({ id: 123, dfeNumber: 567 })
    jest.spyOn(userDataService, 'sqlFindOneByIdentifier').mockResolvedValue({ school_id: 999, roleTitle: roles.teacher })
    jest.spyOn(dfeDataService, 'getDfeRole').mockResolvedValue('mtc_teacher')
    jest.spyOn(userDataService, 'sqlUpdateSchool').mockImplementation()
    jest.spyOn(roleService, 'findByTitle').mockResolvedValue({ id: 3, title: roles.teacher })
    jest.spyOn(userDataService, 'sqlCreate').mockImplementation()
    jest.spyOn(adminLogonEventDataService, 'sqlCreate').mockImplementation()

    const user = await sut.initialiseUser({ organisation: { urn: 12345 } }, token)
    expect(user).toBeDefined()
    expect(user.School).toBeDefined()
    expect(user.School).toBe(567)
    expect(user.schoolId).toBeDefined()
    expect(user.schoolId).toBe(123)
  })

  test('sets timezone to assigned school timezone when provided', async () => {
    jest.spyOn(schoolDataService, 'sqlFindOneByUrn').mockResolvedValue({ id: 123, dfeNumber: 567, timezone: 'the timezone' })
    jest.spyOn(userDataService, 'sqlFindOneByIdentifier').mockResolvedValue({ school_id: 999, roleTitle: roles.teacher })
    jest.spyOn(dfeDataService, 'getDfeRole').mockResolvedValue('mtc_teacher')
    jest.spyOn(userDataService, 'sqlUpdateSchool').mockImplementation()
    jest.spyOn(roleService, 'findByTitle').mockResolvedValue({ id: 3, title: roles.teacher })
    jest.spyOn(userDataService, 'sqlCreate').mockImplementation()
    jest.spyOn(adminLogonEventDataService, 'sqlCreate').mockImplementation()
    const user = await sut.initialiseUser({ organisation: { urn: 12345 } }, token)
    expect(user).toBeDefined()
    expect(user.timezone).toBeDefined()
    expect(user.timezone).toBe('the timezone')
  })

  test('sets timezone to system default when no schoo timezone is set', async () => {
    jest.spyOn(schoolDataService, 'sqlFindOneByUrn').mockResolvedValue({ id: 123, dfeNumber: 567, timezone: undefined })
    jest.spyOn(userDataService, 'sqlFindOneByIdentifier').mockResolvedValue({ school_id: 999, roleTitle: roles.teacher })
    jest.spyOn(dfeDataService, 'getDfeRole').mockResolvedValue('mtc_teacher')
    jest.spyOn(userDataService, 'sqlUpdateSchool').mockImplementation()
    jest.spyOn(roleService, 'findByTitle').mockResolvedValue({ id: 3, title: roles.teacher })
    jest.spyOn(userDataService, 'sqlCreate').mockImplementation()
    jest.spyOn(adminLogonEventDataService, 'sqlCreate').mockImplementation()
    const user = await sut.initialiseUser({ organisation: { urn: 12345 } }, token)
    expect(user).toBeDefined()
    expect(user.timezone).toBeDefined()
    expect(user.timezone).toBe(config.DEFAULT_TIMEZONE)
  })

  test('sets externalUserId to the provided user id and id to the user record id', async () => {
    jest.spyOn(schoolDataService, 'sqlFindOneByUrn').mockResolvedValue({ id: 123, dfeNumber: 567, timezone: undefined })
    jest.spyOn(userDataService, 'sqlFindOneByIdentifier').mockResolvedValue({ school_id: 999, id: 567, roleTitle: roles.teacher })
    jest.spyOn(dfeDataService, 'getDfeRole').mockResolvedValue('mtc_teacher')
    jest.spyOn(userDataService, 'sqlUpdateSchool').mockImplementation()
    jest.spyOn(roleService, 'findByTitle').mockResolvedValue({ id: 3, title: roles.teacher })
    jest.spyOn(userDataService, 'sqlCreate').mockImplementation()
    jest.spyOn(adminLogonEventDataService, 'sqlCreate').mockImplementation()
    const user = await sut.initialiseUser({ organisation: { urn: 12345 }, sub: 'external-user-id' }, token)
    expect(user).toBeDefined()
    expect(user.providerUserId).toBe('external-user-id')
    expect(user.id).toBe(567)
  })

  test('adds adminLogonEvent entry', async () => {
    jest.spyOn(schoolDataService, 'sqlFindOneByUrn').mockResolvedValue({ id: 123, dfeNumber: 567, timezone: undefined })
    jest.spyOn(userDataService, 'sqlFindOneByIdentifier').mockResolvedValue({ school_id: 999, id: 567, roleTitle: roles.teacher })
    jest.spyOn(dfeDataService, 'getDfeRole').mockResolvedValue('mtc_teacher')
    jest.spyOn(userDataService, 'sqlUpdateSchool').mockImplementation()
    jest.spyOn(roleService, 'findByTitle').mockResolvedValue({ id: 3, title: roles.teacher })
    jest.spyOn(userDataService, 'sqlCreate').mockImplementation()
    let persistedAdminLogonEventData
    jest.spyOn(adminLogonEventDataService, 'sqlCreate').mockImplementation((logonEvent) => {
      persistedAdminLogonEventData = logonEvent
    })
    const user = await sut.initialiseUser({ organisation: { urn: 12345 }, sub: 'external-user-id' }, token)
    expect(user).toBeDefined()
    expect(user.providerUserId).toBe('external-user-id')
    expect(user.id).toBe(567)
    expect(adminLogonEventDataService.sqlCreate).toHaveBeenCalled()
    delete user.id
    delete user.school_id
    expect(persistedAdminLogonEventData.body).toEqual(JSON.stringify(user))
  })

  test('updates user role if different to current one', async () => {
    jest.spyOn(dfeDataService, 'getDfeRole').mockResolvedValue('mtc_test_developer')
    jest.spyOn(userDataService, 'sqlUpdateRole').mockImplementation()
    jest.spyOn(userDataService, 'sqlFindOneByIdentifier').mockResolvedValue({ school_id: 999, id: 567, roleTitle: roles.serviceManager })
    jest.spyOn(adminLogonEventDataService, 'sqlCreate').mockImplementation()
    jest.spyOn(roleService, 'findByTitle').mockResolvedValue({ id: 2, title: roles.testDeveloper })

    const user = await sut.initialiseUser({ organisation: { urn: 12345 } }, token)
    expect(userDataService.sqlUpdateRole).toHaveBeenCalled()
    expect(userDataService.sqlFindOneByIdentifier).toHaveBeenCalled()
    expect(user).toBeDefined()
    expect(user.role).toBe(roles.testDeveloper)
  })
})
