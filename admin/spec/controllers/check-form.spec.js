'use strict'
/* global describe beforeEach afterEach it expect jasmine spyOn */

const mongoose = require('mongoose')
//mongoose.set('debug', true)
//const autoIncrement = require('mongoose-auto-increment')
//autoIncrement.initialize(mongoose.connection)
mongoose.Promomise = global.Promise

const sinon = require('sinon')
require('sinon-mongoose')

const proxyquire = require('proxyquire')
const httpMocks = require('node-mocks-http')

// @TODO: FIX. Tests fail due to failing mongoose-auto-increment
//const CheckForm = require('../../models/check-form')
//const checkFormDataService = require('../../services/data-access/check-form.data.service')
//const checkFormService = require('../../services/check-form.service')
const sortingAttributesService = require('../../services/sorting-attributes.service')

const checkFormMock = require('../mocks/check-form')
const checkFormsMock = require('../mocks/check-forms')
const checkFormsFormattedMock = require('../mocks/check-forms-formatted')

describe('check-form controller:', () => {
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
      role: 'TEST-DEVELOPER',
      logonAt: 1511374645103
    }
    req.breadcrumbs = jasmine.createSpy('breadcrumbs')
    req.flash = jasmine.createSpy('flash')
    return req
  }

  describe('Check routes', () => {
    let controller
    let sandbox
    let next
    let goodReqParams = {
      method: 'GET',
      url: '/test-developer/home'
    }

    beforeEach(() => {
      sandbox = sinon.sandbox.create()
      next = jasmine.createSpy('next')
    })

    afterEach(() => {
      sandbox.restore()
    })

    describe('Logging in as a test-developer', () => {
      beforeEach(() => {
        controller = proxyquire('../../controllers/check-form', {}).getTestDeveloperHome
      })

      it('should take me to the \'test-developer\'s the landing page', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(res.locals.pageTitle).toBe('MTC for test development')
        expect(next).not.toHaveBeenCalled()
        done()
      })
    })

    // @TODO: FIX. Tests fail due to failing mongoose-auto-increment
    // describe('Clicking menu option \'Upload and view forms\'', () => {
    //   let htmlSortDirection = 'asc'
    //   let arrowSortDirection = 'asc'
    //
    //   beforeEach(() => {
    //     spyOn(sortingAttributesService, 'getAttributes').and.returnValue({htmlSortDirection, arrowSortDirection})
    //     spyOn(checkFormService, 'formatCheckFormsAndWindows').and.returnValue(checkFormsFormattedMock)
    //     controller = proxyquire('../../controllers/check-form', {}).uploadAndViewForms
    //   })
    //
    //   it('should take me to \'Upload and view forms\' page', async (done) => {
    //     const res = getRes()
    //     const req = getReq(goodReqParams)
    //     req.url = 'test-developer/upload-and-view-forms'
    //     await controller(req, res, next)
    //     expect(res.statusCode).toBe(200)
    //     expect(res.locals.pageTitle).toBe('Upload and view forms')
    //     expect(next).not.toHaveBeenCalled()
    //     done()
    //   })
    // })

    // @TODO: FIX. Tests fail due to failing mongoose-auto-increment
    // describe('Removing a form', () => {
    //   beforeEach(() => {
    //     spyOn(checkFormDataService, 'getActiveForm').and.returnValue()
    //     spyOn(checkWindowService, 'getCheckWindowsAssignedToForms').and.returnValue()
    //     spyOn(checkWindowService, 'markAsDeleted').and.returnValue())
    //     spyOn(checkFormService, 'unassignedCheckFormsFromCheckWindows').and.returnValue()
    //     controller = proxyquire('../../controllers/check-form', {}).removeCheckForm
    //   })
    //
    //   xit('should...', () => {
    //
    //   })
    // })

    describe('Clicking upload form button', () => {
      beforeEach(() => {
        controller = proxyquire('../../controllers/check-form', {}).uploadCheckForm
      })

      it('should take me to the upload file page', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(res.locals.pageTitle).toBe('Upload new form')
        expect(next).not.toHaveBeenCalled()
        done()
      })
    })

    // @TODO: FIX. Tests fail due to failing mongoose-auto-increment
    // describe('Saving a form', () => {
    //   beforeEach(() => {
    //     spyOn(checkFormService, 'populateFromFile').and.returnValue()
    //     controller = proxyquire('../../controllers/check-form', {}).saveCheckForm
    //   })
    //
    //   xit('should...', () => {
    //
    //   })
    // })
  })
})
