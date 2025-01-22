'use strict'

const httpMocks = require('node-mocks-http')
const R = require('ramda')

const userDataService = require('../../../services/data-access/user.data.service')
const adminLogonEventDataService = require('../../../services/data-access/admin-logon-event.data.service')
const validateAndSave = require('../../../authentication/local-strategy')

describe('localStrategy', () => {
  describe('validateAndSave', () => {
    const reqParams = {
      method: 'GET',
      session: {
        id: 1
      },
      connection: {
        remoteAddress: 'remoteAddress'
      }
    }
    const req = httpMocks.createRequest(reqParams)

    test('validates and saves a valid helpdesk user', async () => {
      const user = {
        id: 1,
        passwordHash: '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK',
        identifier: 'helpdesk',
        roleName: 'HELPDESK',
        schoolId: null,
        dfeNumber: null,
        timezone: null
      }
      jest.spyOn(userDataService, 'sqlFindUserInfoByIdentifier').mockResolvedValue(user)
      jest.spyOn(adminLogonEventDataService, 'sqlCreate').mockImplementation()
      const doneFunc = (err, res) => err || res
      const result = await validateAndSave(req, 'helpdesk', 'password', doneFunc)
      // comparing everything except given timestamp
      expect(R.omit(['logonAt'], result)).toEqual({
        EmailAddress: user.identifier,
        displayName: user.identifier,
        UserName: user.identifier,
        UserType: 'SchoolNom',
        School: null,
        schoolId: null,
        timezone: null,
        role: user.roleName,
        id: user.id
      })
    })

    test('validates and saves a valid teacher user', async () => {
      const user = {
        id: 1,
        passwordHash: '$2a$10$.WsawgZpWSAQVaa6Vz3P1.XO.1YntYJLd6Da5lrXCAkVxhhLpkOHK',
        identifier: 'teacher1',
        roleName: 'TEACHER',
        schoolId: 1,
        dfeNumber: 9991000,
        timezone: ''
      }
      jest.spyOn(userDataService, 'sqlFindUserInfoByIdentifier').mockResolvedValue(user)
      jest.spyOn(adminLogonEventDataService, 'sqlCreate').mockImplementation()
      const doneFunc = (err, res) => err || res
      const result = await validateAndSave(req, 'teacher1', 'password', doneFunc)
      expect(R.omit(['logonAt'], result)).toEqual({
        EmailAddress: user.identifier,
        displayName: user.identifier,
        UserName: user.identifier,
        UserType: 'SchoolNom',
        schoolId: 1,
        School: 9991000,
        timezone: '',
        role: user.roleName,
        id: user.id
      })
    })

    test('registers an invalid logon event if user is not found', async () => {
      jest.spyOn(userDataService, 'sqlFindUserInfoByIdentifier').mockImplementation()
      jest.spyOn(adminLogonEventDataService, 'sqlCreate').mockImplementation()
      const doneFunc = (err, res) => err || res
      await validateAndSave(req, 'teacher1', 'password', doneFunc)
      expect(adminLogonEventDataService.sqlCreate).toHaveBeenCalledWith(
        { sessionId: 1, body: '{}', remoteIp: 'remoteAddress', userAgent: undefined, loginMethod: 'local', errorMsg: 'Invalid user', isAuthenticated: false, school_id: null }
      )
    })
  })
})
