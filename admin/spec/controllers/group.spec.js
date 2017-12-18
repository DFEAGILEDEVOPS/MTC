'use strict'

/* global describe beforeEach it expect jasmine spyOn */

const httpMocks = require('node-mocks-http')
require('sinon-mongoose')

const groupService = require('../../services/group.service')
const groupsMock = require('../mocks/groups')

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
      beforeEach(() => {
        spyOn(groupService, 'getGroups').and.returnValue(groupsMock)
        controller = require('../../controllers/group').groupPupilsPage
      })

      it('should render the initial groups page (happy path)', async (done) => {
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

      it('should execute next when rendering fails (unhappy path)', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParams)
        spyOn(res, 'render').and.throwError('test')
        await controller(req, res, next)

        expect(res.locals.pageTitle).toBe('Group pupils')
        expect(groupService.getGroups).toHaveBeenCalled()
        expect(res.render).toHaveBeenCalled()
        expect(next).toHaveBeenCalled()
        expect(res.statusCode).toBe(200)
        done()
      })
    })
  })
})
