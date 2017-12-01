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

const CheckForm = require('../../models/check-form')

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
    let res
    let req
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
      res = getRes()
      req = getReq(goodReqParams)
    })

    afterEach(() => {
      sandbox.restore()
    })

    describe('Logging in as a test-developer', () => {
      beforeEach(() => {
        controller = proxyquire('../../controllers/check-form', {}).getTestDeveloperHome
      })

      it('should take me to the \'test-developer\'s the landing page', async (done) => {
        await controller(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(res.locals.pageTitle).toBe('MTC for test development')
        expect(next).not.toHaveBeenCalled()
        done()
      })

      it('should execute next when rendering fails', async (done) => {
        spyOn(res, 'render').and.throwError('error')
        await controller(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(res.locals.pageTitle).toBe('MTC for test development')
        expect(next).toHaveBeenCalled()
        done()
      })
    })

    describe('Clicking menu option \'Upload and view forms\'', () => {
      let htmlSortDirection = 'asc'
      let arrowSortDirection = 'asc'

      beforeEach(() => {
        spyOn(sortingAttributesService, 'getAttributes').and.returnValue({htmlSortDirection, arrowSortDirection})
        controller = proxyquire('../../controllers/check-form', {}).uploadAndViewForms
        req.url = 'test-developer/upload-and-view-forms'
      })

      it('should take me to \'Upload and view forms\' page', async (done) => {
        spyOn(checkFormService, 'formatCheckFormsAndWindows').and.returnValue(checkFormsFormattedMock)
        await controller(req, res, next)

        expect(res.statusCode).toBe(200)
        expect(res.locals.pageTitle).toBe('Upload and view forms')
        expect(next).not.toHaveBeenCalled()
        expect(sortingAttributesService.getAttributes).toHaveBeenCalled()
        expect(checkFormService.formatCheckFormsAndWindows).toHaveBeenCalled()
        done()
      })

      it('should fail and execute next', async (done) => {
        spyOn(checkFormService, 'formatCheckFormsAndWindows').and.returnValue(Promise.reject(new Error('error')))
        await controller(req, res, next)

        expect(res.statusCode).toBe(200)
        expect(res.locals.pageTitle).toBe('Upload and view forms')
        expect(sortingAttributesService.getAttributes).toHaveBeenCalled()
        expect(checkFormService.formatCheckFormsAndWindows).toHaveBeenCalled()
        expect(next).toHaveBeenCalled()
        done()
      })
    })

    describe('Removing a form', () => {
      beforeEach(() => {
        spyOn(checkFormService, 'unassignedCheckFormsFromCheckWindows').and.returnValue(checkFormsFormattedMock)
        spyOn(checkWindowService, 'markAsDeleted').and.returnValue(checkFormMock)
        controller = proxyquire('../../controllers/check-form', {}).removeCheckForm
        res = getRes()
        req = getReq(goodReqParams)
      })

      it('should soft delete a form and redirect the user', async (done) => {
        spyOn(checkFormDataService, 'getActiveForm').and.returnValue(checkFormMock)
        spyOn(checkWindowService, 'getCheckWindowsAssignedToForms').and.returnValue(checkFormsByWindowMock)

        await controller(req, res, next)
        expect(res.statusCode).toBe(302)
        expect(next).not.toHaveBeenCalled()
        expect(checkFormDataService.getActiveForm).toHaveBeenCalled()
        expect(checkWindowService.getCheckWindowsAssignedToForms).toHaveBeenCalled()
        expect(checkWindowService.markAsDeleted).toHaveBeenCalled()
        expect(checkFormService.unassignedCheckFormsFromCheckWindows).toHaveBeenCalled()
        done()
      })

      it('should fail when getActiveForm method fails', async (done) => {
        spyOn(checkFormDataService, 'getActiveForm').and.returnValue(Promise.reject(new Error('error')))
        spyOn(checkWindowService, 'getCheckWindowsAssignedToForms').and.returnValue()

        await controller(req, res, next)
        expect(checkFormDataService.getActiveForm).toHaveBeenCalled()
        expect(checkWindowService.getCheckWindowsAssignedToForms).not.toHaveBeenCalled()
        expect(checkFormService.unassignedCheckFormsFromCheckWindows).not.toHaveBeenCalled()
        expect(checkWindowService.markAsDeleted).not.toHaveBeenCalled()
        expect(next).toHaveBeenCalled()
        done()
      })

      it('should fail when trying to soft delete', async (done) => {
        spyOn(checkFormDataService, 'getActiveForm').and.returnValue(checkFormMock)
        spyOn(checkWindowService, 'getCheckWindowsAssignedToForms').and.returnValue(Promise.reject(new Error('error')))

        await controller(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(next).toHaveBeenCalled()
        expect(checkFormDataService.getActiveForm).toHaveBeenCalled()
        expect(checkWindowService.getCheckWindowsAssignedToForms).toHaveBeenCalled()
        expect(checkFormService.unassignedCheckFormsFromCheckWindows).not.toHaveBeenCalled()
        expect(checkWindowService.markAsDeleted).not.toHaveBeenCalled()
        done()
      })
    })

    describe('Clicking upload form button', () => {
      beforeEach(() => {
        controller = proxyquire('../../controllers/check-form', {}).uploadCheckForm
      })

      it('should take me to the upload file page', async (done) => {
        await controller(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(res.locals.pageTitle).toBe('Upload new form')
        expect(next).not.toHaveBeenCalled()
        done()
      })

      it('should fail and execute next if rendering fails', async (done) => {
        spyOn(res, 'render').and.throwError('error')
        await controller(req, res, next)
        expect(res.statusCode).toBe(200)
        expect(res.locals.pageTitle).toBe('Upload new form')
        expect(next).toHaveBeenCalled()
        done()
      })
    })

    describe('Saving a form', () => {
      beforeEach(() => {
        spyOn(checkFormService, 'populateFromFile').and.returnValue(checkFormMock)
        spyOn(CheckForm, 'create').and.returnValue(Promise.resolve(checkFormMock))
        spyOn(fs, 'remove').and.returnValue(checkFormMock)
        controller = proxyquire('../../controllers/check-form', {}).saveCheckForm

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
      })

      it('should save the form and redirect the user', async (done) => {
        let checkForm = {}
        checkForm.validate = () => {}
        checkForm.save = () => {}

        try {
          await controller(req, res, next)
          expect(res.locals.pageTitle).toBe('Upload check form')
          expect(checkFormService.populateFromFile).toHaveBeenCalled()
          expect(next).not.toHaveBeenCalled()
          expect(res.statusCode).toBe(200)
          done()
        } catch (error) {
          console.log('ERROR', error)
        }

        try {
          await checkForm.save()
          expect(req.flash).toBeTruthy()
        } catch (error) {
          console.log('ERROR (2)', error)
        }
      })

      it('should render the page with errors if file does not exists', async (done) => {
        req.files.csvFile = null

        try {
          await controller(req, res, next)
          const uploadFile = req.files.csvFile
          if (!uploadFile) {
            expect(res.locals.pageTitle).toBe('ERROR: Upload check form')
            expect(checkFormService.populateFromFile).not.toHaveBeenCalled()
            expect(next).not.toHaveBeenCalled()
            expect(res.statusCode).toBe(200)
          }
          done()
        } catch (error) {
          console.log('ERROR', error)
        }
      })
    })

    describe('Saving a form fails', () => {
      it('should render the page with errors if method populateFromFile fails', async (done) => {
        spyOn(checkFormService, 'populateFromFile').and.returnValue(Promise.reject(new Error('error')))
        spyOn(CheckForm, 'create').and.returnValue(Promise.resolve(checkFormMock))
        spyOn(fs, 'remove').and.returnValue(null)
        controller = proxyquire('../../controllers/check-form', {}).saveCheckForm

        req.method = 'POST'
        req.url = 'test-developer/upload-new-form'
        req.files = {}
        req.files.csvFile = {
          uuid: 'ff6c17d9-84d0-4a9b-a3c4-3f94a6ccdc40',
          field: 'uploadFile',
          file: 'data/files/ff6c17d9-84d0-4a9b-a3c4-3f94a6ccdc40/uploadFile/form-1.csv',
          filename: 'form-1.csv',
          filename: 'form-1.csv',
          encoding: '7bit',
          mimetype: 'text/csv',
          truncated: false,
          done: true
        }

        try {
          await controller(req, res, next)
          expect(checkFormService.populateFromFile).toHaveBeenCalled()
        } catch (error) {
          expect(fs.remove).toHaveBeenCalled()
        }
        expect(next).not.toHaveBeenCalled()
        expect(res.locals.pageTitle).toBe('Upload check form')
        expect(res.statusCode).toBe(200)
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
        req.url = '/test-developer/view-form/29'

        try {
          await controller(req, res, next)
          expect(checkFormDataService.getActiveFormPlain).toHaveBeenCalled()
        } catch (error) {
          console.log('ERROR (1)', error)
        }

        try {
          expect(checkWindowService.getCheckWindowsAssignedToForms).toHaveBeenCalled()
        } catch (error) {
          console.log('ERROR (2)', error)
        }

        expect(next).not.toHaveBeenCalled()
        expect(res.locals.pageTitle).toBe('View form')
        expect(res.statusCode).toBe(200)
        done()
      })
    })

    describe('Clicking a form fails', () => {
      beforeEach(() => {
        spyOn(checkFormService, 'checkWindowNames').and.returnValue('Check Window 1')
        spyOn(checkFormService, 'canDelete').and.returnValue(false)
        spyOn(console, 'log').and.returnValue('test')

        controller = proxyquire('../../controllers/check-form', {}).displayCheckForm
      })

      it('should catch an error when getActiveFormPlain fails', async (done) => {
        spyOn(checkFormDataService, 'getActiveFormPlain').and.returnValue(Promise.reject(new Error('error')))
        spyOn(checkWindowService, 'getCheckWindowsAssignedToForms').and.returnValue(function () { return Promise.resolve(checkFormsByWindowMock) })
        req.url = '/test-developer/view-form/29'

        try {
          await controller(req, res, next)
          expect(checkFormDataService.getActiveFormPlain).toHaveBeenCalled()
        } catch (error) {
          expect(console.log).toHaveBeenCalled()
        }

        expect(next).not.toHaveBeenCalled()
        expect(res.locals.pageTitle).toBe('View form')
        expect(res.statusCode).toBe(302)
        done()
      })

      it('should catch an error when getCheckWindowsAssignedToForms fails', async (done) => {
        spyOn(checkFormDataService, 'getActiveFormPlain').and.returnValue(Promise.resolve(checkFormMock))
        spyOn(checkWindowService, 'getCheckWindowsAssignedToForms').and.returnValue(Promise.reject(new Error('error')))
        req.url = '/test-developer/view-form/29'

        try {
          await controller(req, res, next)
          expect(checkWindowService.getCheckWindowsAssignedToForms).toHaveBeenCalled()
        } catch (error) {
          expect(console.log).toHaveBeenCalled()
        }

        expect(next).not.toHaveBeenCalled()
        expect(res.locals.pageTitle).toBe('View form')
        expect(res.statusCode).toBe(200)
        done()
      })
    })
  })
})
