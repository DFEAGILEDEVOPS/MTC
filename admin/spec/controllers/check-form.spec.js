'use strict'
/* global describe beforeEach afterEach it expect jasmine spyOn */

const proxyquire = require('proxyquire')
const httpMocks = require('node-mocks-http')

const sinon = require('sinon')
require('sinon-mongoose')
const fs = require('fs-extra')

const checkWindowService = require('../../services/check-window.service')
const checkWindowDataService = require('../../services/data-access/check-window.data.service')
const checkFormDataService = require('../../services/data-access/check-form.data.service')
const checkFormService = require('../../services/check-form.service')
const sortingAttributesService = require('../../services/sorting-attributes.service')

const checkFormMock = require('../mocks/check-form')
const checkFormsMock = require('../mocks/check-forms')
const checkFormsFormattedMock = require('../mocks/check-forms-formatted')
const checkFormsByWindowMock = require('../mocks/check-window-by-form')
const checkWindowMock = require('../mocks/check-window')
const checkWindowsMock = require('../mocks/check-windows')

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
        controller = proxyquire('../../controllers/check-form', {}).getTestDeveloperHomePage
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

    describe('#uploadAndViewFormsPage - Happy path', () => {
      let htmlSortDirection = 'asc'
      let arrowSortDirection = 'asc'

      beforeEach(() => {
        spyOn(sortingAttributesService, 'getAttributes').and.returnValue({htmlSortDirection, arrowSortDirection})
        spyOn(checkFormService, 'formatCheckFormsAndWindows').and.returnValue(checkFormsFormattedMock)
        controller = proxyquire('../../controllers/check-form', {}).uploadAndViewFormsPage
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

    describe('#removeCheckForm - Happy path', () => {
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

    describe('#uploadCheckForm - Happy path', () => {
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

    describe('#saveCheckForm - Saving a check form', () => {
      function standardReq () {
        let req
        req = getReq(goodReqParams)

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

        return req
      }

      describe('Happy path', () => {
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
          const req = standardReq()

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

      describe('Unhappy path - When checkFormDataService.create fails', () => {
        beforeEach(() => {
          spyOn(checkFormService, 'populateFromFile').and.returnValue(checkFormMock)
          spyOn(checkFormService, 'buildFormName').and.returnValue('MTC0100.csv')
          spyOn(checkFormService, 'validateCheckFormName').and.returnValue('MTC0100')
          spyOn(checkFormDataService, 'create').and.returnValue(Promise.reject(new Error('Error')))
          spyOn(fs, 'remove').and.returnValue(checkFormMock)
          controller = proxyquire('../../controllers/check-form', {}).saveCheckForm
        })

        it('should execute next when #create fails', async (done) => {
          const res = getRes()
          const req = standardReq()

          try {
            await controller(req, res, next)
            expect(res.locals.pageTitle).toBe('Upload check form')
            expect(checkFormService.populateFromFile).toHaveBeenCalled()
            expect(checkFormService.buildFormName).toHaveBeenCalled()
            expect(checkFormService.validateCheckFormName).toHaveBeenCalled()
            expect(checkFormDataService.create).toHaveBeenCalled()
            expect(next).toHaveBeenCalled()
            expect(res.statusCode).toBe(200)
          } catch (error) {
            expect(error).toBe('not thrown')
          }
          done()
        })
      })

      describe('Unhappy path - When checkFormService.populateFromFile fails', () => {
        beforeEach(() => {
          spyOn(checkFormService, 'populateFromFile').and.returnValue(Promise.reject(new Error('Error')))
          spyOn(checkFormService, 'buildFormName').and.returnValue('MTC0100.csv')
          spyOn(checkFormService, 'validateCheckFormName').and.returnValue('MTC0100')
          spyOn(checkFormDataService, 'create').and.returnValue((Promise.resolve(checkFormMock)))
          spyOn(fs, 'remove').and.returnValue(checkFormMock)
          controller = proxyquire('../../controllers/check-form', {}).saveCheckForm
        })

        it('should handle #populateFromFile failure', async (done) => {
          const res = getRes()
          const req = standardReq()

          try {
            await controller(req, res, next)
            expect(res.locals.pageTitle).toBe('Upload check form')
            expect(checkFormService.populateFromFile).toHaveBeenCalled()
            expect(checkFormService.buildFormName).not.toHaveBeenCalled()
            expect(checkFormService.validateCheckFormName).not.toHaveBeenCalled()
            expect(checkFormDataService.create).not.toHaveBeenCalled()
            expect(next).not.toHaveBeenCalled()
            expect(res.statusCode).toBe(200)
          } catch (error) {
            expect(error).toBe('not thrown')
          }

          done()
        })
      })

      describe('Unhappy path - When checkFormService.buildFormName returns false', () => {
        beforeEach(() => {
          spyOn(checkFormService, 'populateFromFile').and.returnValue(checkFormMock)
          spyOn(checkFormService, 'buildFormName').and.returnValue(false)
          spyOn(checkFormService, 'validateCheckFormName').and.returnValue('MTC0100')
          spyOn(checkFormDataService, 'create').and.returnValue(Promise.resolve(checkFormMock))
          spyOn(fs, 'remove').and.returnValue(checkFormMock)
          controller = proxyquire('../../controllers/check-form', {}).saveCheckForm
        })

        it('should handle #buildFormName failure', async (done) => {
          const res = getRes()
          const req = standardReq()

          try {
            await controller(req, res, next)
            expect(res.locals.pageTitle).toBe('Upload check form')
            expect(checkFormService.populateFromFile).toHaveBeenCalled()
            expect(checkFormService.buildFormName).toHaveBeenCalled()
            expect(checkFormService.validateCheckFormName).not.toHaveBeenCalled()
            expect(checkFormDataService.create).not.toHaveBeenCalled()
            expect(next).not.toHaveBeenCalled()
            expect(res.statusCode).toBe(302)
          } catch (error) {
            expect(error).toBe('not thrown')
          }

          done()
        })
      })

      describe('Unhappy path - When checkFormService.validateCheckFormName fails', () => {
        beforeEach(() => {
          spyOn(checkFormService, 'populateFromFile').and.returnValue(checkFormMock)
          spyOn(checkFormService, 'buildFormName').and.returnValue('MTC0100')
          spyOn(checkFormService, 'validateCheckFormName').and.returnValue(Promise.reject(new Error('Error')))
          spyOn(checkFormDataService, 'create').and.returnValue(Promise.resolve(checkFormMock))
          spyOn(fs, 'remove').and.returnValue(checkFormMock)
          controller = proxyquire('../../controllers/check-form', {}).saveCheckForm
        })

        it('should handle #validateCheckFormName failure', async (done) => {
          const res = getRes()
          const req = standardReq()

          try {
            await controller(req, res, next)
            expect(res.locals.pageTitle).toBe('Upload check form')
            expect(checkFormService.populateFromFile).toHaveBeenCalled()
            expect(checkFormService.buildFormName).toHaveBeenCalled()
            expect(checkFormService.validateCheckFormName).toHaveBeenCalled()
            expect(checkFormDataService.create).not.toHaveBeenCalled()
            expect(next).toHaveBeenCalled()
            expect(res.statusCode).toBe(200)
          } catch (error) {
            expect(error).toBe('not thrown')
          }

          done()
        })
      })
    })

    describe('#displayCheckForm - Clicking a form', () => {
      describe('Happy path', () => {
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
          req.params = {
            formId: 29
          }
          await controller(req, res, next)
          expect(res.statusCode).toBe(200)
          expect(checkFormDataService.getActiveFormPlain).toHaveBeenCalled()
          expect(checkWindowService.getCheckWindowsAssignedToForms).toHaveBeenCalled()
          expect(checkFormService.checkWindowNames).toHaveBeenCalled()
          expect(res.locals.pageTitle).toBe('View form')
          done()
        })
      })

      describe('Unhappy path - checkFormDataService.getActiveFormPlain fails', () => {
        beforeEach(() => {
          spyOn(checkFormDataService, 'getActiveFormPlain').and.returnValue(Promise.reject(new Error('Error')))
          spyOn(checkWindowService, 'getCheckWindowsAssignedToForms').and.returnValue(checkFormsByWindowMock)
          spyOn(checkFormService, 'checkWindowNames').and.returnValue('Check Window 1')
          spyOn(checkFormService, 'canDelete').and.returnValue(false)
          controller = proxyquire('../../controllers/check-form', {}).displayCheckForm
        })

        it('should redirect the user if #getActiveFormPlain fails', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.url = '/test-developer/view-form/29'
          await controller(req, res, next)
          expect(res.locals.pageTitle).toBe('View form')
          expect(checkFormDataService.getActiveFormPlain).toHaveBeenCalled()
          expect(checkWindowService.getCheckWindowsAssignedToForms).not.toHaveBeenCalled()
          expect(checkFormService.checkWindowNames).not.toHaveBeenCalled()
          expect(res.statusCode).toBe(302)
          done()
        })
      })

      describe('Unhappy path - checkWindowService.getCheckWindowsAssignedToForms', () => {
        beforeEach(() => {
          spyOn(checkFormDataService, 'getActiveFormPlain').and.returnValue(checkFormMock)
          spyOn(checkWindowService, 'getCheckWindowsAssignedToForms').and.returnValue(Promise.reject(new Error('Error')))
          spyOn(checkFormService, 'checkWindowNames').and.returnValue('Check Window 1')
          spyOn(checkFormService, 'canDelete').and.returnValue(false)
          controller = proxyquire('../../controllers/check-form', {}).displayCheckForm
        })

        it('should redirect the user if #getCheckWindowsAssignedToForms fails', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.url = '/test-developer/view-form/29'
          await controller(req, res, next)
          expect(res.locals.pageTitle).toBe('View form')
          expect(checkFormDataService.getActiveFormPlain).toHaveBeenCalled()
          expect(checkWindowService.getCheckWindowsAssignedToForms).toHaveBeenCalled()
          expect(checkFormService.checkWindowNames).not.toHaveBeenCalled()
          expect(req.flash).toBeTruthy()
          expect(res.statusCode).toBe(302)
          done()
        })
      })
    })

    describe('#assignCheckFormsToWindowsPage - Initial page to assign check forms to check windows', () => {
      describe('Happy path', () => {
        beforeEach(() => {
          spyOn(checkWindowService, 'getCurrentCheckWindowsAndCountForms').and.returnValue(checkFormMock)
          spyOn(checkFormDataService, 'fetchSortedActiveForms').and.returnValue(checkFormsMock)
          controller = proxyquire('../../controllers/check-form', {}).assignCheckFormsToWindowsPage
        })

        it('should render the correct page', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          spyOn(res, 'render').and.returnValue(null)
          req.url = '/test-developer/assign-form-to-window'
          await controller(req, res, next)
          expect(checkWindowService.getCurrentCheckWindowsAndCountForms).toHaveBeenCalled()
          expect(checkFormDataService.fetchSortedActiveForms).toHaveBeenCalled()
          expect(res.locals.pageTitle).toBe('Assign forms to check windows')
          expect(res.render).toHaveBeenCalled()
          expect(res.statusCode).toBe(200)
          expect(next).not.toHaveBeenCalled()
          done()
        })
      })

      describe('Unhappy path - When #getCurrentCheckWindowsAndCountForms fails', () => {
        beforeEach(() => {
          spyOn(checkWindowService, 'getCurrentCheckWindowsAndCountForms').and.returnValue(Promise.reject(new Error('Error')))
          spyOn(checkFormDataService, 'fetchSortedActiveForms').and.returnValue(checkFormsMock)
          controller = proxyquire('../../controllers/check-form', {}).assignCheckFormsToWindowsPage
        })

        it('should render the correct page', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.url = '/test-developer/assign-form-to-window'

          await controller(req, res, next)
          expect(checkFormDataService.fetchSortedActiveForms).toHaveBeenCalled()
          expect(checkWindowService.getCurrentCheckWindowsAndCountForms).toHaveBeenCalled()
          expect(res.locals.pageTitle).toBe('Assign forms to check windows')
          expect(res.statusCode).toBe(200)
          expect(next).toHaveBeenCalled()
          done()
        })
      })
    })

    describe('#assignCheckFormToWindowPage - Page to assign check forms to chosen check window', () => {
      describe('Happy path', () => {
        beforeEach(() => {
          spyOn(checkWindowDataService, 'fetchCheckWindow').and.returnValue(checkWindowMock)
          spyOn(checkFormService, 'getUnassignedFormsForCheckWindow').and.returnValue(checkWindowsMock)
          controller = proxyquire('../../controllers/check-form', {}).assignCheckFormToWindowPage
        })

        it('should render the correct page', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          spyOn(res, 'render').and.returnValue(null)
          req.params.checkWindowId = '5a1ff0eefb8e09530d76976f'
          req.url = `/test-developer/assign-form-to-window/${req.params.checkWindowId}`

          await controller(req, res, next)
          expect(checkWindowDataService.fetchCheckWindow).toHaveBeenCalled()
          expect(checkFormService.getUnassignedFormsForCheckWindow).toHaveBeenCalled()
          expect(res.render).toHaveBeenCalled()
          expect(res.locals.pageTitle).toBe('Assign forms')
          expect(res.statusCode).toBe(200)
          expect(next).not.toHaveBeenCalled()
          done()
        })
      })

      describe('Unhappy path - When checkWindowDataService.fetchCheckWindow fails', () => {
        beforeEach(() => {
          spyOn(checkWindowDataService, 'fetchCheckWindow').and.returnValue(Promise.reject(new Error('Error')))
          spyOn(checkFormService, 'getUnassignedFormsForCheckWindow').and.returnValue(checkWindowsMock)
          controller = proxyquire('../../controllers/check-form', {}).assignCheckFormToWindowPage
        })

        it('should execute next', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          spyOn(res, 'render').and.returnValue(null)
          req.params.checkWindowId = '5a1ff0eefb8e09530d76976f'
          req.url = `/test-developer/assign-form-to-window/${req.params.checkWindowId}`

          try {
            await controller(req, res, next)
            expect(checkWindowDataService.fetchCheckWindow).toHaveBeenCalled()
            expect(checkFormService.getUnassignedFormsForCheckWindow).not.toHaveBeenCalled()
            expect(res.locals.pageTitle).toBe('Assign forms')
            expect(res.statusCode).toBe(200)
            expect(next).toHaveBeenCalled()
            done()
          } catch (error) {
            console.log('ERROR (checkWindowDataService.fetchCheckWindow)', error)
            expect(error).toBe('Error')
            done(error)
          }
        })
      })

      describe('#assignCheckFormToWindowPage - Unhappy path - When checkFormService.getUnassignedFormsForCheckWindow fails', () => {
        beforeEach(() => {
          spyOn(checkWindowDataService, 'fetchCheckWindow').and.returnValue(checkWindowMock)
          spyOn(checkFormService, 'getUnassignedFormsForCheckWindow').and.returnValue(Promise.reject(new Error('Error')))
          controller = proxyquire('../../controllers/check-form', {}).assignCheckFormToWindowPage
        })

        it('should execute next', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          spyOn(res, 'render').and.returnValue(null)
          req.params.checkWindowId = '5a1ff0eefb8e09530d76976f'
          req.url = `/test-developer/assign-form-to-window/${req.params.checkWindowId}`

          try {
            await controller(req, res, next)
            expect(checkWindowDataService.fetchCheckWindow).toHaveBeenCalled()
            expect(checkFormService.getUnassignedFormsForCheckWindow).toHaveBeenCalled()
            expect(res.locals.pageTitle).toBe('Assign forms')
            expect(res.statusCode).toBe(200)
            expect(next).toHaveBeenCalled()
            done()
          } catch (error) {
            console.log('ERROR (checkFormService.getUnassignedFormsForCheckWindow)', error)
            expect(error).toBe('Error')
            done(error)
          }
        })
      })
    })

    describe('#saveAssignCheckFormsToWindow - Save forms to chosen check window', () => {
      describe('Happy path', () => {
        const mergedFormIds = [5, 6, 7, 8]
        beforeEach(() => {
          spyOn(checkWindowDataService, 'fetchCheckWindow').and.returnValue(checkWindowsMock)
          spyOn(checkWindowService, 'mergedFormIds').and.returnValue(mergedFormIds)
          spyOn(checkFormDataService, 'create').and.returnValue(Promise.resolve(checkFormMock))
          controller = proxyquire('../../controllers/check-form', {}).saveAssignCheckFormsToWindow
        })

        it('should redirect the user', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.method = 'POST'
          req.url = '/test-developer/assign-form-to-window'
          req.body = {
            checkWindowName: 'Check Window 1',
            checkWindowId: '59e88622d38a9f2d1fcebbb3',
            checkForm: [5, 6, 7]
          }
          
          try {
            await controller(req, res, next)
            expect(checkWindowDataService.fetchCheckWindow).toHaveBeenCalled()
            expect(checkWindowService.mergedFormIds).toHaveBeenCalled()
            // expect(checkFormDataService.create).toHaveBeenCalled()
            // expect(res.statusCode).toBe(302)
            // expect(next).not.toHaveBeenCalled()
            done()
          } catch (error) {
            expect(error).toBe('not thrown')
          }
        })
      })
    })

    describe('#unassignCheckFormsFromWindowPage - Render page to unassign check forms from check windows', () => {
      describe('Happy path', () => {
        beforeEach(() => {
          const assignedCheckForms = [
            { '_id': 100, 'name': 'MTC0100' }
          ]
          spyOn(checkWindowDataService, 'fetchCheckWindow').and.returnValue(checkWindowMock)
          spyOn(checkFormService, 'getAssignedFormsForCheckWindow').and.returnValue(assignedCheckForms)
          controller = proxyquire('../../controllers/check-form', {}).unassignCheckFormsFromWindowPage
        })

        it('should render the correct page', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          spyOn(res, 'render').and.returnValue(null)
          req.params.checkWindowId = '5a1ff0eefb8e09530d76976f'
          req.url = `/test-developer/unassign-forms/${req.params.checkWindowId}`

          await controller(req, res, next)
          expect(checkWindowDataService.fetchCheckWindow).toHaveBeenCalled()
          expect(checkFormService.getAssignedFormsForCheckWindow).toHaveBeenCalled()
          expect(res.render).toHaveBeenCalled()
          expect(res.locals.pageTitle).toBe('Check Window Name')
          expect(res.statusCode).toBe(200)
          expect(next).not.toHaveBeenCalled()
          done()
        })
      })
    })

    describe('Unhappy path - When checkWindowDataService.fetchCheckWindow', () => {
      beforeEach(() => {
        const assignedCheckForms = [
          { '_id': 100, 'name': 'MTC0100' }
        ]
        spyOn(checkWindowDataService, 'fetchCheckWindow').and.returnValue(Promise.reject(new Error('Error')))
        spyOn(checkFormService, 'getAssignedFormsForCheckWindow').and.returnValue(assignedCheckForms)
        controller = proxyquire('../../controllers/check-form', {}).unassignCheckFormsFromWindowPage
      })

      it('should execute next if #fetchCheckWindow fails', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParams)
        spyOn(res, 'render').and.returnValue(null)
        req.params.checkWindowId = '5a1ff0eefb8e09530d76976f'
        req.url = `/test-developer/unassign-forms/${req.params.checkWindowId}`

        await controller(req, res, next)
        expect(checkWindowDataService.fetchCheckWindow).toHaveBeenCalled()
        expect(checkFormService.getAssignedFormsForCheckWindow).not.toHaveBeenCalled()
        expect(res.render).not.toHaveBeenCalled()
        expect(res.locals.pageTitle).toBe(undefined)
        expect(res.statusCode).toBe(200)
        expect(next).toHaveBeenCalled()
        done()
      })
    })

    describe('Unhappy path - When checkFormService.getAssignedFormsForCheckWindow', () => {
      beforeEach(() => {
        spyOn(checkWindowDataService, 'fetchCheckWindow').and.returnValue(checkWindowMock)
        spyOn(checkFormService, 'getAssignedFormsForCheckWindow').and.returnValue(Promise.reject(new Error('Error')))
        controller = proxyquire('../../controllers/check-form', {}).unassignCheckFormsFromWindowPage
      })

      it('should execute next if #getAssignedFormsForCheckWindow fails', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParams)
        spyOn(res, 'render').and.returnValue(null)
        req.params.checkWindowId = '5a1ff0eefb8e09530d76976f'
        req.url = `/test-developer/unassign-forms/${req.params.checkWindowId}`

        await controller(req, res, next)
        expect(checkWindowDataService.fetchCheckWindow).toHaveBeenCalled()
        expect(checkFormService.getAssignedFormsForCheckWindow).toHaveBeenCalled()
        expect(res.render).not.toHaveBeenCalled()
        expect(res.locals.pageTitle).toBe(undefined)
        expect(res.statusCode).toBe(200)
        expect(next).toHaveBeenCalled()
        done()
      })

      it('should redirect the user and show a flash error if req.params.checkWindowId is false', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParams)
        spyOn(res, 'render').and.returnValue(null)
        req.params.checkWindowId = null
        req.url = `/test-developer/unassign-forms/${req.params.checkWindowId}`

        await controller(req, res, next)
        expect(checkWindowDataService.fetchCheckWindow).not.toHaveBeenCalled()
        expect(checkFormService.getAssignedFormsForCheckWindow).not.toHaveBeenCalled()
        expect(res.render).not.toHaveBeenCalled()
        expect(res.locals.pageTitle).toBe(undefined)
        expect(res.statusCode).toBe(302)
        expect(req.flash).toBeTruthy()
        done()
      })
    })

    describe('#unassignCheckFormFromWindow (POST) ', () => {
      describe('happy path', () => {
        beforeEach(() => {
          const finalCheckForms = [100, 102, 103]
          spyOn(checkWindowDataService, 'fetchCheckWindow').and.returnValue(checkWindowMock)
          spyOn(checkFormService, 'removeFormIdFromArray').and.returnValue(finalCheckForms)
          spyOn(checkWindowDataService, 'create')
          controller = proxyquire('../../controllers/check-form', {}).unassignCheckFormFromWindow
        })

        it('should save and redirect the user', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.body.checkWindowId = '5a1ff0eefb8e09530d76976f'
          req.body.checkFormId = 101
          req.url = `/test-developer/unassign-form`

          await controller(req, res, next)
          expect(checkWindowDataService.fetchCheckWindow).toHaveBeenCalled()
          expect(checkFormService.removeFormIdFromArray).toHaveBeenCalled()
          expect(checkWindowDataService.create).toHaveBeenCalled()
          expect(res.statusCode).toBe(302)
          expect(next).not.toHaveBeenCalled()
          done()
        })
      })

      describe('Unhappy path - checkWindowDataService.fetchCheckWindow fails', () => {
        beforeEach(() => {
          const finalCheckForms = [100, 102, 103]
          spyOn(checkWindowDataService, 'fetchCheckWindow').and.returnValue(Promise.reject(new Error('Error')))
          spyOn(checkFormService, 'removeFormIdFromArray').and.returnValue(finalCheckForms)
          spyOn(checkWindowDataService, 'create')
          controller = proxyquire('../../controllers/check-form', {}).unassignCheckFormFromWindow
        })

        it('should execute next if #checkWindowDataService.fetchCheckWindow fails', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.body.checkWindowId = '5a1ff0eefb8e09530d76976f'
          req.body.checkFormId = 101
          req.url = `/test-developer/unassign-form`

          await controller(req, res, next)
          expect(checkWindowDataService.fetchCheckWindow).toHaveBeenCalled()
          expect(checkFormService.removeFormIdFromArray).not.toHaveBeenCalled()
          expect(checkWindowDataService.create).not.toHaveBeenCalled()
          expect(res.statusCode).toBe(200)
          expect(next).toHaveBeenCalled()
          done()
        })
      })

      describe('Unhappy path(s) - checkWindowDataService.create fails or req.body is incomplete', () => {
        beforeEach(() => {
          const finalCheckForms = [100, 102, 103]
          spyOn(checkWindowDataService, 'fetchCheckWindow').and.returnValue(checkWindowMock)
          spyOn(checkFormService, 'removeFormIdFromArray').and.returnValue(finalCheckForms)
          spyOn(checkWindowDataService, 'create').and.returnValue(Promise.reject(new Error('Error')))
          controller = proxyquire('../../controllers/check-form', {}).unassignCheckFormFromWindow
        })

        it('should redirect the user and show a flash message if #checkWindowDataService.create fails', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.body.checkWindowId = '5a1ff0eefb8e09530d76976f'
          req.body.checkFormId = 101
          req.url = `/test-developer/unassign-form`

          await controller(req, res, next)
          expect(checkWindowDataService.fetchCheckWindow).toHaveBeenCalled()
          expect(checkFormService.removeFormIdFromArray).toHaveBeenCalled()
          expect(checkWindowDataService.create).toHaveBeenCalled()
          expect(req.flash).toBeTruthy()
          expect(res.statusCode).toBe(302)
          done()
        })

        it('should redirect the user if req.body.checkWindowId is false', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.body.checkWindowId = null
          req.body.checkFormId = 101
          req.url = `/test-developer/unassign-form`

          await controller(req, res, next)
          expect(checkWindowDataService.fetchCheckWindow).not.toHaveBeenCalled()
          expect(checkFormService.removeFormIdFromArray).not.toHaveBeenCalled()
          expect(checkWindowDataService.create).not.toHaveBeenCalled()
          expect(req.flash).toBeTruthy()
          expect(res.statusCode).toBe(302)
          done()
        })

        it('should redirect the user if req.body.checkFormId is false', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.body.checkWindowId = '5a1ff0eefb8e09530d76976f'
          req.body.checkFormId = null
          req.url = `/test-developer/unassign-form`

          await controller(req, res, next)
          expect(checkWindowDataService.fetchCheckWindow).not.toHaveBeenCalled()
          expect(checkFormService.removeFormIdFromArray).not.toHaveBeenCalled()
          expect(checkWindowDataService.create).not.toHaveBeenCalled()
          expect(req.flash).toBeTruthy()
          expect(res.statusCode).toBe(302)
          done()
        })
      })
    })
  })
})
