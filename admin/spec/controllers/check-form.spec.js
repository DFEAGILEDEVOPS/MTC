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
        const checkForm = new CheckForm
        checkForm.validate = () => {}
        checkForm.save = () => {}

        spyOn(checkFormService, 'populateFromFile').and.returnValue(checkFormMock)
        spyOn(CheckForm, 'create').and.returnValue(Promise.resolve(checkFormMock))
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
          const result = await controller(req, res, next)
          console.log('RESULT', result)

          expect(res.locals.pageTitle).toBe('Upload check form')
          expect(checkFormService.populateFromFile).toHaveBeenCalled()
          expect(next).not.toHaveBeenCalled()
          expect(res.statusCode).toBe(200)
          done()
        } catch (error) {
          console.log('ERROR', error)
        }

        try {
          await CheckForm.validate()
        } catch (error) {
          console.log('ERROR (2)', error)
        }

        try {
          await CheckForm.save()
          console.log('REQ.FLASH', req.flash)
        } catch (error) {
          console.log('ERROR (3)', error)
        }
      })
    })
  })
})
