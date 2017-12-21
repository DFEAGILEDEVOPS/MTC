'use strict'

/* global describe beforeEach it expect jasmine spyOn */

const httpMocks = require('node-mocks-http')
require('sinon-mongoose')

const groupService = require('../../services/group.service')
const groupDataService = require('../../services/data-access/group.data.service')
const groupValidator = require('../../lib/validator/group-validator')
const groupMock = require('../mocks/group')
const groupsMock = require('../mocks/groups')
const pupilsMock = require('../mocks/pupils-with-reason')

describe('group.js controller', () => {
  function getRes () {
    const res = httpMocks.createResponse()
    res.locals = {}
    return res
  }

  function getReq (params) {
    const req = httpMocks.createRequest(params)
    req.user = {
      EmailAddress: 'test-developer',
      UserName: 'test-developer',
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
      url: '/school/group-pupils'
    }

    beforeEach(() => {
      next = jasmine.createSpy('next')
    })

    describe('#groupPupilsPage', () => {
      describe('(happy path)', () => {
        beforeEach(() => {
          spyOn(groupService, 'getGroups').and.returnValue(groupsMock)
          controller = require('../../controllers/group').groupPupilsPage
        })

        it('should render the initial groups page', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          spyOn(res, 'render').and.returnValue(null)
          await controller(req, res, next)

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
          controller = require('../../controllers/group').groupPupilsPage
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
          controller = require('../../controllers/group').manageGroupPage
        })

        it('should render the add page', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          spyOn(res, 'render').and.returnValue(null)
          await controller(req, res, next)

          expect(res.locals.pageTitle).toBe('Add group')
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
          controller = require('../../controllers/group').manageGroupPage
        })

        it('should fail to render the edit page and execute next', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.params.groupId = '123456abcde'
          spyOn(res, 'render').and.returnValue(null)
          await controller(req, res, next)

          expect(res.locals.pageTitle).toBeUndefined()
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
          controller = require('../../controllers/group').manageGroupPage
        })

        it('should fail to render the add page and execute next', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          spyOn(res, 'render').and.returnValue(null)
          await controller(req, res, next)

          expect(res.locals.pageTitle).toBeUndefined()
          expect(groupService.getGroupById).not.toHaveBeenCalled()
          expect(groupService.getPupils).toHaveBeenCalled()
          expect(next).toHaveBeenCalled()
          expect(res.render).not.toHaveBeenCalled()
          expect(res.statusCode).toBe(200)
          done()
        })
      })
    })
  })
})
