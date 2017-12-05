'use strict'
/* global describe beforeEach afterEach it expect jasmine spyOn */

const proxyquire = require('proxyquire')
const httpMocks = require('node-mocks-http')

const sinon = require('sinon')
require('sinon-mongoose')
const fs = require('fs-extra')

const checkWindowService = require('../../services/check-window.service')
const checkFormDataService = require('../../services/data-access/check-form.data.service')
const checkFormService = require('../../services/check-form.service')
const sortingAttributesService = require('../../services/sorting-attributes.service')

const checkFormMock = require('../mocks/check-form')
const checkFormsFormattedMock = require('../mocks/check-forms-formatted')
const checkFormsByWindowMock = require('../mocks/check-window-by-form')

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
        spyOn(res, 'render').and.returnValue(null)
        await controller(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(res.locals.pageTitle).toBe('MTC for test development')
        expect(res.render).toHaveBeenCalled()
        expect(next).not.toHaveBeenCalled()
        done()
      })
    })

    describe('Clicking menu option \'Upload and view forms\'', () => {
      let htmlSortDirection = 'asc'
      let arrowSortDirection = 'asc'

      beforeEach(() => {
        spyOn(sortingAttributesService, 'getAttributes').and.returnValue({htmlSortDirection, arrowSortDirection})
        spyOn(checkFormService, 'formatCheckFormsAndWindows').and.returnValue(checkFormsFormattedMock)
        controller = proxyquire('../../controllers/check-form', {}).uploadAndViewForms
      })

      it('should take me to \'Upload and view forms\' page', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParams)
        req.url = 'test-developer/upload-and-view-forms'
        await controller(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(res.locals.pageTitle).toBe('Upload and view forms')
        expect(next).not.toHaveBeenCalled()
        expect(sortingAttributesService.getAttributes).toHaveBeenCalled()
        expect(checkFormService.formatCheckFormsAndWindows).toHaveBeenCalled()
        done()
      })
    })

    describe('Removing a form', () => {
      beforeEach(() => {
        spyOn(checkFormDataService, 'getActiveForm').and.returnValue(checkFormMock)
        spyOn(checkWindowService, 'getCheckWindowsAssignedToForms').and.returnValue(checkFormsByWindowMock)
        spyOn(checkWindowService, 'markAsDeleted').and.returnValue(checkFormMock)
        spyOn(checkFormService, 'unassignedCheckFormsFromCheckWindows').and.returnValue(checkFormsFormattedMock)
        controller = proxyquire('../../controllers/check-form', {}).removeCheckForm
      })

      it('should soft delete a form and redirect the user', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParams)
        await controller(req, res, next)
        expect(res.statusCode).toBe(302)
        expect(next).not.toHaveBeenCalled()
        expect(checkFormDataService.getActiveForm).toHaveBeenCalled()
        expect(checkWindowService.getCheckWindowsAssignedToForms).toHaveBeenCalled()
        expect(checkWindowService.markAsDeleted).toHaveBeenCalled()
        expect(checkFormService.unassignedCheckFormsFromCheckWindows).toHaveBeenCalled()
        done()
      })
    })

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

    describe('Saving a form', () => {
      beforeEach(() => {
        spyOn(checkFormService, 'populateFromFile').and.returnValue(checkFormMock)
        spyOn(checkFormService, 'buildFormName').and.returnValue('MTC0100.csv')
        spyOn(checkFormService, 'validateCheckFormName').and.returnValue('MTC0100')
        spyOn(checkFormDataService, 'create').and.returnValue(Promise.resolve(checkFormMock))
        spyOn(fs, 'remove').and.returnValue(checkFormMock)
        controller = proxyquire('../../controllers/check-form', {}).saveCheckForm
      })

      it('should save the form and redirect the user', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParams)

        req.method = 'POST'
        req.url = 'test-developer/upload-new-form'
        req.files = {}
        req.files.csvFile = {
          uuid: 'ff6c17d9-84d0-4a9b-a3c4-3f94a6ccdc40',
          field: 'uploadFile',
          file: 'data/files/ff6c17d9-84d0-4a9b-a3c4-3f94a6ccdc40/uploadFile/form-1.csv',
          filename: 'form-1.csv',
          encoding: '7bit',
          mimetype: 'text/csv',
          truncated: false,
          done: true
        }

        try {
          await controller(req, res, next)
          expect(res.locals.pageTitle).toBe('Upload check form')
          expect(checkFormService.populateFromFile).toHaveBeenCalled()
          expect(checkFormService.buildFormName).toHaveBeenCalled()
          expect(checkFormService.validateCheckFormName).toHaveBeenCalled()
          expect(checkFormDataService.create).toHaveBeenCalled()
          expect(next).not.toHaveBeenCalled()
          expect(res.statusCode).toBe(302)
        } catch (error) {
          expect(error).toBe('not thrown')
        }
        done()
      })
    })

    describe('Clicking a form', () => {
      beforeEach(() => {
        spyOn(checkFormDataService, 'getActiveFormPlain').and.returnValue(checkFormMock)
        spyOn(checkWindowService, 'getCheckWindowsAssignedToForms').and.returnValue(checkFormsByWindowMock)
        spyOn(checkFormService, 'checkWindowNames').and.returnValue('Check Window 1')
        spyOn(checkFormService, 'canDelete').and.returnValue(false)
        controller = proxyquire('../../controllers/check-form', {}).displayCheckForm
      })

      it('should take me to the form page detail', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParams)
        req.url = '/test-developer/view-form/29'
        await controller(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(checkFormDataService.getActiveFormPlain).toHaveBeenCalled()
        expect(checkWindowService.getCheckWindowsAssignedToForms).toHaveBeenCalled()
        expect(res.locals.pageTitle).toBe('View form')
        expect(next).not.toHaveBeenCalled()
        done()
      })
    })
  })
})
