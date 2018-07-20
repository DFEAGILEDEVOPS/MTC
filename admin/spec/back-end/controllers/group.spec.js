'use strict'

/* global describe beforeEach it expect jasmine spyOn */

const httpMocks = require('node-mocks-http')
const ValidationError = require('../../../lib/validation-error')
const groupService = require('../../../services/group.service')
const groupDataService = require('../../../services/data-access/group.data.service')
const groupValidator = require('../../../lib/validator/group-validator')
const groupMock = require('../mocks/group')
const groupsMock = require('../mocks/groups')
const groupDeletedMock = require('../mocks/group-deleted')
const pupilsMock = require('../mocks/pupils-with-reason')

describe('group controller', () => {
  function getRes () {
    const res = httpMocks.createResponse()
    res.locals = {}
    return res
  }

  function getReq (params) {
    const req = httpMocks.createRequest(params)
    req.user = {
      EmailAddress: 'teacher1',
      UserName: 'teacher1',
      UserType: 'SchoolNom',
      role: 'TEACHER',
      logonAt: 1511374645103
    }
    req.breadcrumbs = jasmine.createSpy('breadcrumbs')
    req.flash = jasmine.createSpy('flash')
    return req
  }

  describe('Check routes', () => {
    let controller
    let next
    let goodReqParams = {
      method: 'GET',
      url: '/group/pupils-list'
    }

    beforeEach(() => {
      next = jasmine.createSpy('next')
    })

    describe('#groupPupilsPage', () => {
      describe('(happy path)', () => {
        beforeEach(() => {
          spyOn(groupService, 'getGroups').and.returnValue(groupsMock)
          controller = require('../../../controllers/group')
        })

        it('should render the initial groups page', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          spyOn(res, 'render').and.returnValue(null)
          await controller.groupPupilsPage(req, res, next)

          expect(res.locals.pageTitle).toBe('Group pupils')
          expect(groupService.getGroups).toHaveBeenCalled()
          expect(next).not.toHaveBeenCalled()
          expect(res.render).toHaveBeenCalled()
          expect(res.statusCode).toBe(200)
          done()
        })
      })

      describe('(unhappy path)', () => {
        beforeEach(() => {
          spyOn(groupService, 'getGroups').and.returnValue(Promise.reject(new Error()))
          controller = require('../../../controllers/group').groupPupilsPage
        })

        it('should render the initial groups page', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          spyOn(res, 'render').and.returnValue(null)
          await controller(req, res, next)

          expect(res.locals.pageTitle).toBe('Group pupils')
          expect(groupService.getGroups).toHaveBeenCalled()
          expect(next).toHaveBeenCalled()
          expect(res.render).toHaveBeenCalled()
          expect(res.statusCode).toBe(200)
          done()
        })
      })
    })

    describe('#manageGroupPage', () => {
      describe('(happy path)', () => {
        beforeEach(() => {
          spyOn(groupService, 'getGroupById').and.returnValue(groupMock)
          spyOn(groupService, 'getPupils').and.returnValue(pupilsMock)
          controller = require('../../../controllers/group').manageGroupPage
        })

        it('should render the add page', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          spyOn(res, 'render').and.returnValue(null)
          await controller(req, res, next)

          expect(res.locals.pageTitle).toBe('Create group')
          expect(groupService.getGroupById).not.toHaveBeenCalled()
          expect(groupService.getPupils).toHaveBeenCalled()
          expect(next).not.toHaveBeenCalled()
          expect(res.render).toHaveBeenCalled()
          expect(res.statusCode).toBe(200)
          done()
        })

        it('should render the edit page', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.params.groupId = '123456abcde'
          spyOn(res, 'render').and.returnValue(null)
          await controller(req, res, next)

          expect(res.locals.pageTitle).toBe('Edit group')
          expect(groupService.getGroupById).toHaveBeenCalled()
          expect(groupService.getPupils).toHaveBeenCalled()
          expect(next).not.toHaveBeenCalled()
          expect(res.render).toHaveBeenCalled()
          expect(res.statusCode).toBe(200)
          done()
        })
      })

      describe('(happy path)', () => {
        beforeEach(() => {
          spyOn(groupService, 'getGroupById').and.returnValue(groupMock)
          spyOn(groupService, 'getPupils').and.returnValue(pupilsMock)
          controller = require('../../../controllers/group').manageGroupPage
        })

        it('should render the add page', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          spyOn(res, 'render').and.returnValue(null)
          await controller(req, res, next)

          expect(res.locals.pageTitle).toBe('Create group')
          expect(groupService.getGroupById).not.toHaveBeenCalled()
          expect(groupService.getPupils).toHaveBeenCalled()
          expect(next).not.toHaveBeenCalled()
          expect(res.render).toHaveBeenCalled()
          expect(res.statusCode).toBe(200)
          done()
        })

        it('should render the edit page', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.params.groupId = '123456abcde'
          spyOn(res, 'render').and.returnValue(null)
          await controller(req, res, next)

          expect(res.locals.pageTitle).toBe('Edit group')
          expect(groupService.getGroupById).toHaveBeenCalled()
          expect(groupService.getPupils).toHaveBeenCalled()
          expect(next).not.toHaveBeenCalled()
          expect(res.render).toHaveBeenCalled()
          expect(res.statusCode).toBe(200)
          done()
        })
      })

      describe('(unhappy path)', () => {
        beforeEach(() => {
          spyOn(groupService, 'getGroupById').and.returnValue(Promise.reject(new Error()))
          spyOn(groupService, 'getPupils').and.returnValue(pupilsMock)
          controller = require('../../../controllers/group').manageGroupPage
        })

        it('should fail to render the edit page and execute next', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.params.groupId = '123456abcde'
          spyOn(res, 'render').and.returnValue(null)
          await controller(req, res, next)

          expect(res.locals.pageTitle).toBe('Edit group')
          expect(groupService.getGroupById).toHaveBeenCalled()
          expect(groupService.getPupils).not.toHaveBeenCalled()
          expect(next).toHaveBeenCalled()
          expect(res.render).not.toHaveBeenCalled()
          expect(res.statusCode).toBe(200)
          done()
        })
      })

      describe('(unhappy path)', () => {
        beforeEach(() => {
          spyOn(groupService, 'getGroupById').and.returnValue(groupMock)
          spyOn(groupService, 'getPupils').and.returnValue(Promise.reject(new Error()))
          controller = require('../../../controllers/group').manageGroupPage
        })

        it('should fail to render the add page and execute next', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          spyOn(res, 'render').and.returnValue(null)
          await controller(req, res, next)

          expect(res.locals.pageTitle).toBe('Create group')
          expect(groupService.getGroupById).not.toHaveBeenCalled()
          expect(groupService.getPupils).toHaveBeenCalled()
          expect(next).toHaveBeenCalled()
          expect(res.render).not.toHaveBeenCalled()
          expect(res.statusCode).toBe(200)
          done()
        })
      })
    })

    describe('#addGroup', () => {
      describe('(happy path)', () => {
        it('should create a new group', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.method = 'POST'
          req.body = {
            name: 'Test Group 1',
            pupil: ['5a324c40c9decb39628b84a2', '5a324c40c9decb39628b84a3', '5a324c40c9decb39628b84a4']
          }

          const validationError = new ValidationError()
          spyOn(groupValidator, 'validate').and.returnValue(validationError)
          spyOn(groupService, 'getPupils').and.returnValue(pupilsMock)
          spyOn(groupService, 'create').and.returnValue(Promise.resolve(groupMock))

          controller = require('../../../controllers/group').addGroup
          await controller(req, res, next)

          expect(validationError.hasError()).toBeFalsy()
          expect(groupValidator.validate).toHaveBeenCalled()
          expect(groupService.getPupils).not.toHaveBeenCalled()
          expect(groupService.create).toHaveBeenCalled()
          expect(next).not.toHaveBeenCalled()
          expect(res.statusCode).toBe(302)
          done()
        })
      })

      describe('(unhappy path)', () => {
        it('should fail to create a new group', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.method = 'POST'
          req.body = {
            name: 'Test Group 1',
            pupil: ['5a324c40c9decb39628b84a2', '5a324c40c9decb39628b84a3', '5a324c40c9decb39628b84a4']
          }

          const validationError = new ValidationError()
          spyOn(groupValidator, 'validate').and.returnValue(validationError)
          spyOn(groupService, 'getPupils').and.returnValue(pupilsMock)
          spyOn(groupService, 'create').and.returnValue(Promise.reject(new Error()))

          controller = require('../../../controllers/group').addGroup
          await controller(req, res, next)

          expect(validationError.hasError()).toBeFalsy()
          expect(groupValidator.validate).toHaveBeenCalled()
          expect(groupService.getPupils).not.toHaveBeenCalled()
          expect(groupService.create).toHaveBeenCalled()
          expect(next).toHaveBeenCalled()
          expect(res.statusCode).toBe(200)
          done()
        })
      })

      describe('(unhappy path)', () => {
        it('should fail when form has errors', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.method = 'POST'
          req.body = {
            name: 'T',
            pupil: ['5a324c40c9decb39628b84a2']
          }

          const validationError = new ValidationError()
          validationError.addError('test', 'test')

          spyOn(groupValidator, 'validate').and.returnValue(validationError)
          spyOn(groupService, 'getPupils').and.returnValue(Promise.resolve(groupMock))
          spyOn(groupService, 'create').and.returnValue(Promise.resolve(groupMock))

          controller = require('../../../controllers/group').addGroup
          await controller(req, res, next)

          expect(res.locals.pageTitle).toBe('Create group')
          expect(validationError.hasError()).toBeTruthy()
          expect(groupValidator.validate).toHaveBeenCalled()
          expect(groupService.getPupils).toHaveBeenCalled()
          expect(groupService.create).not.toHaveBeenCalled()
          expect(next).not.toHaveBeenCalled()
          expect(res.statusCode).toBe(200)
          done()
        })
      })

      describe('(unhappy path)', () => {
        it('should fail when getPupils fails', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.method = 'POST'
          req.body = {
            name: 'T',
            pupil: ['5a324c40c9decb39628b84a2']
          }

          const validationError = new ValidationError()
          validationError.addError('test', 'test')

          spyOn(groupValidator, 'validate').and.returnValue(validationError)
          spyOn(groupService, 'getPupils').and.returnValue(Promise.reject(new Error()))

          controller = require('../../../controllers/group').addGroup
          await controller(req, res, next)

          expect(res.locals.pageTitle).toBe('Create group')
          expect(validationError.hasError()).toBeTruthy()
          expect(groupValidator.validate).toHaveBeenCalled()
          expect(groupService.getPupils).toHaveBeenCalled()
          expect(next).toHaveBeenCalled()
          expect(res.statusCode).toBe(200)
          done()
        })
      })

      describe('(unhappy path)', () => {
        beforeEach(() => {
          spyOn(groupValidator, 'validate').and.returnValue()
          spyOn(groupService, 'getPupils').and.returnValue(pupilsMock)
          spyOn(groupService, 'create').and.returnValue(Promise.resolve(groupMock))
          controller = require('../../../controllers/group').addGroup
        })

        it('should redirect when name and/or pupil body are empty', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.method = 'POST'
          req.body = {
            name: '',
            pupil: null
          }

          await controller(req, res, next)
          expect(res.locals.pageTitle).toBeUndefined()
          expect(groupValidator.validate).not.toHaveBeenCalled()
          expect(groupService.getPupils).not.toHaveBeenCalled()
          expect(groupService.create).not.toHaveBeenCalled()
          expect(next).not.toHaveBeenCalled()
          expect(res.statusCode).toBe(302)
          done()
        })
      })
    })

    describe('#editGroup', () => {
      describe('(happy path)', () => {
        it('should edit a group', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.method = 'POST'
          req.body = {
            name: 'Test Group 1',
            pupil: ['5a324c40c9decb39628b84a2', '5a324c40c9decb39628b84a3', '5a324c40c9decb39628b84a4'],
            groupId: '123456abcde'
          }

          const validationError = new ValidationError()
          spyOn(groupService, 'getGroupById').and.returnValue(groupMock)
          spyOn(groupService, 'getPupils').and.returnValue(pupilsMock)
          spyOn(groupValidator, 'validate').and.returnValue(validationError)
          spyOn(groupService, 'update').and.returnValue(Promise.resolve(groupMock))

          controller = require('../../../controllers/group').editGroup
          await controller(req, res, next)

          expect(validationError.hasError()).toBeFalsy()
          expect(groupService.getGroupById).toHaveBeenCalled()
          expect(groupValidator.validate).toHaveBeenCalled()
          expect(groupService.getPupils).not.toHaveBeenCalled()
          expect(groupService.update).toHaveBeenCalled()
          expect(next).not.toHaveBeenCalled()
          expect(res.statusCode).toBe(302)
          done()
        })
      })

      describe('(unhappy path)', () => {
        it('should redirect the user when req.body is incomplete', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.method = 'POST'
          req.body = {
            name: '',
            pupil: null,
            groupId: '123456abcde'
          }

          const validationError = new ValidationError()
          spyOn(groupService, 'getGroupById').and.returnValue(groupMock)
          spyOn(groupService, 'getPupils').and.returnValue(pupilsMock)
          spyOn(groupValidator, 'validate').and.returnValue(validationError)
          spyOn(groupService, 'update').and.returnValue(Promise.resolve(groupMock))

          controller = require('../../../controllers/group').editGroup
          await controller(req, res, next)

          expect(validationError.hasError()).toBeFalsy()
          expect(groupService.getGroupById).not.toHaveBeenCalled()
          expect(groupValidator.validate).not.toHaveBeenCalled()
          expect(groupService.getPupils).not.toHaveBeenCalled()
          expect(groupService.update).not.toHaveBeenCalled()
          expect(next).not.toHaveBeenCalled()
          expect(res.statusCode).toBe(302)
          done()
        })
      })

      describe('(unhappy path)', () => {
        it('should execute next when getGroupById fails', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.method = 'POST'
          req.body = {
            name: 'Test Group 1',
            pupil: ['5a324c40c9decb39628b84a2', '5a324c40c9decb39628b84a3', '5a324c40c9decb39628b84a4'],
            groupId: '123456abcde'
          }

          const validationError = new ValidationError()
          spyOn(groupService, 'getGroupById').and.returnValue(Promise.reject(new Error()))
          spyOn(groupService, 'getPupils').and.returnValue(pupilsMock)
          spyOn(groupValidator, 'validate').and.returnValue(validationError)
          spyOn(groupService, 'update').and.returnValue(Promise.resolve(groupMock))

          controller = require('../../../controllers/group').editGroup
          await controller(req, res, next)

          expect(validationError.hasError()).toBeFalsy()
          expect(groupService.getGroupById).toHaveBeenCalled()
          expect(groupValidator.validate).not.toHaveBeenCalled()
          expect(groupService.getPupils).not.toHaveBeenCalled()
          expect(groupService.update).not.toHaveBeenCalled()
          expect(next).toHaveBeenCalled()
          expect(res.statusCode).toBe(200)
          done()
        })
      })

      describe('(unhappy path)', () => {
        it('should execute next when form validation fails', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.method = 'POST'
          req.body = {
            name: 'Test Group 1',
            pupil: ['5a324c40c9decb39628b84a2', '5a324c40c9decb39628b84a3', '5a324c40c9decb39628b84a4'],
            groupId: '123456abcde'
          }

          const validationError = new ValidationError()
          validationError.addError('test', 'test')

          spyOn(groupService, 'getGroupById').and.returnValue(Promise.resolve(groupMock))
          spyOn(groupService, 'getPupils').and.returnValue(pupilsMock)
          spyOn(groupValidator, 'validate').and.returnValue(validationError)
          spyOn(groupService, 'update').and.returnValue(Promise.resolve(groupMock))

          controller = require('../../../controllers/group').editGroup
          await controller(req, res, next)

          expect(res.locals.pageTitle).toBe('Edit group')
          expect(validationError.hasError()).toBeTruthy()
          expect(groupService.getGroupById).toHaveBeenCalled()
          expect(groupValidator.validate).toHaveBeenCalled()
          expect(groupService.getPupils).toHaveBeenCalled()
          expect(groupService.update).not.toHaveBeenCalled()
          expect(next).not.toHaveBeenCalled()
          expect(res.statusCode).toBe(200)
          done()
        })
      })

      describe('(unhappy path)', () => {
        it('should execute next when getPupils fails', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.method = 'POST'
          req.body = {
            name: 'Test Group 1',
            pupil: ['5a324c40c9decb39628b84a2', '5a324c40c9decb39628b84a3', '5a324c40c9decb39628b84a4'],
            groupId: '123456abcde'
          }

          const validationError = new ValidationError()
          validationError.addError('test', 'test')

          spyOn(groupService, 'getGroupById').and.returnValue(Promise.resolve(groupMock))
          spyOn(groupService, 'getPupils').and.returnValue(Promise.reject(new Error()))
          spyOn(groupValidator, 'validate').and.returnValue(validationError)
          spyOn(groupService, 'update').and.returnValue(Promise.resolve(groupMock))

          controller = require('../../../controllers/group').editGroup
          await controller(req, res, next)

          expect(res.locals.pageTitle).toBeUndefined()
          expect(validationError.hasError()).toBeTruthy()
          expect(groupService.getGroupById).toHaveBeenCalled()
          expect(groupValidator.validate).toHaveBeenCalled()
          expect(groupService.getPupils).toHaveBeenCalled()
          expect(groupService.update).not.toHaveBeenCalled()
          expect(next).toHaveBeenCalled()
          expect(res.statusCode).toBe(200)
          done()
        })
      })

      describe('(unhappy path)', () => {
        it('should execute next when update fails', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.method = 'POST'
          req.body = {
            name: 'Test Group 1',
            pupil: ['5a324c40c9decb39628b84a2', '5a324c40c9decb39628b84a3', '5a324c40c9decb39628b84a4'],
            groupId: '123456abcde'
          }

          const validationError = new ValidationError()

          spyOn(groupService, 'getGroupById').and.returnValue(Promise.resolve(groupMock))
          spyOn(groupService, 'getPupils').and.returnValue(pupilsMock)
          spyOn(groupValidator, 'validate').and.returnValue(validationError)
          spyOn(groupService, 'update').and.returnValue(Promise.reject(new Error()))

          controller = require('../../../controllers/group').editGroup
          await controller(req, res, next)

          expect(res.locals.pageTitle).toBeUndefined()
          expect(validationError.hasError()).toBeFalsy()
          expect(groupService.getGroupById).toHaveBeenCalled()
          expect(groupValidator.validate).toHaveBeenCalled()
          expect(groupService.getPupils).not.toHaveBeenCalled()
          expect(groupService.update).toHaveBeenCalled()
          expect(next).toHaveBeenCalled()
          expect(res.statusCode).toBe(200)
          done()
        })
      })
    })

    describe('#removeGroup', () => {
      describe('(happy path)', () => {
        it('should soft-delete a group', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.method = 'GET'
          req.params = {
            groupId: '123456abcde'
          }

          spyOn(groupDataService, 'sqlMarkGroupAsDeleted').and.returnValue(Promise.resolve(groupDeletedMock))

          controller = require('../../../controllers/group').removeGroup
          await controller(req, res, next)

          expect(groupDataService.sqlMarkGroupAsDeleted).toHaveBeenCalled()
          expect(next).not.toHaveBeenCalled()
          expect(res.statusCode).toBe(302)
          done()
        })
      })

      describe('(unhappy path - missing parameter group id)', () => {
        it('should soft-delete a group', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.method = 'GET'
          req.params = {
            groupId: null
          }

          spyOn(groupDataService, 'sqlMarkGroupAsDeleted').and.returnValue(Promise.resolve(groupDeletedMock))

          controller = require('../../../controllers/group').removeGroup
          await controller(req, res, next)

          expect(groupDataService.sqlMarkGroupAsDeleted).not.toHaveBeenCalled()
          expect(next).not.toHaveBeenCalled()
          expect(res.statusCode).toBe(302)
          done()
        })
      })

      describe('(unhappy path - soft-delete fails )', () => {
        it('should soft-delete a group', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.method = 'GET'
          req.params = {
            groupId: '123456abcde'
          }

          spyOn(groupDataService, 'sqlMarkGroupAsDeleted').and.returnValue(Promise.reject(new Error()))

          controller = require('../../../controllers/group').removeGroup
          await controller(req, res, next)

          expect(groupDataService.sqlMarkGroupAsDeleted).toHaveBeenCalled()
          expect(next).toHaveBeenCalled()
          expect(res.statusCode).toBe(200)
          done()
        })
      })
    })
  })
})
