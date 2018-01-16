'use strict'
/* global describe beforeEach it expect jasmine spyOn */

const httpMocks = require('node-mocks-http')
const fs = require('fs-extra')

const checkWindowService = require('../../services/check-window.service')
const checkWindowDataService = require('../../services/data-access/check-window.data.service')
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
    let next
    let goodReqParams = {
      method: 'GET',
      url: '/test-developer/home'
    }

    beforeEach(() => {
      next = jasmine.createSpy('next')
    })

    describe('#getTestDeveloperHomePage - Happy path', () => {
      beforeEach(() => {
        controller = require('../../controllers/check-form').getTestDeveloperHomePage
      })

      it('should render the \'test-developer\'s the landing page', async (done) => {
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

    describe('#uploadAndViewFormsPage - Display initial \'upload and view\' check forms page.', () => {
      let htmlSortDirection = 'asc'
      let arrowSortDirection = 'asc'

      describe('Happy path', () => {
        beforeEach(() => {
          spyOn(sortingAttributesService, 'getAttributes').and.returnValue({htmlSortDirection, arrowSortDirection})
          spyOn(checkFormService, 'formatCheckFormsAndWindows').and.returnValue(checkFormsFormattedMock)
          controller = require('../../controllers/check-form').uploadAndViewFormsPage
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

      describe('Unhappy path', () => {
        beforeEach(() => {
          spyOn(sortingAttributesService, 'getAttributes').and.returnValue({htmlSortDirection, arrowSortDirection})
          spyOn(checkFormService, 'formatCheckFormsAndWindows').and.returnValue(Promise.reject(new Error('Error')))
          controller = require('../../controllers/check-form').uploadAndViewFormsPage
        })

        it('should execute next if #formatCheckFormsAndWindows fails', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.url = 'test-developer/upload-and-view-forms'
          await controller(req, res, next)
          expect(res.statusCode).toBe(200)
          expect(res.locals.pageTitle).toBe('Upload and view forms')
          expect(sortingAttributesService.getAttributes).toHaveBeenCalled()
          expect(checkFormService.formatCheckFormsAndWindows).toHaveBeenCalled()
          expect(next).toHaveBeenCalled()
          done()
        })
      })
    })

    describe('#removeCheckForm', () => {
      describe('Happy path', () => {
        beforeEach(() => {
          spyOn(checkFormService, 'deleteCheckForm').and.returnValue(Promise.resolve())
          controller = require('../../controllers/check-form').removeCheckForm
        })

        it('should soft delete a form and redirect the user', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          await controller(req, res, next)
          expect(res.statusCode).toBe(302)
          expect(next).not.toHaveBeenCalled()
          expect(checkFormService.deleteCheckForm).toHaveBeenCalled()
          done()
        })
      })

      describe('#Unhappy path - deleteCheckForm fails', () => {
        beforeEach(() => {
          spyOn(checkFormService, 'deleteCheckForm').and.returnValue(Promise.reject(new Error('Error')))
          controller = require('../../controllers/check-form').removeCheckForm
        })

        it('should execute next when deleteCheckForm fails', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          await controller(req, res, next)

          expect(checkFormService.deleteCheckForm).toHaveBeenCalled()
          expect(next).toHaveBeenCalled()
          expect(res.statusCode).toBe(200)
          done()
        })
      })
    })

    describe('#uploadCheckForm - Happy path', () => {
      beforeEach(() => {
        controller = require('../../controllers/check-form').uploadCheckForm
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
          spyOn(checkFormService, 'create').and.returnValue(Promise.resolve(checkFormMock))
          spyOn(fs, 'remove').and.returnValue(checkFormMock)
          controller = require('../../controllers/check-form').saveCheckForm
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
            expect(checkFormService.create).toHaveBeenCalled()
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
          spyOn(checkFormService, 'create').and.returnValue(Promise.reject(new Error('Error')))
          spyOn(fs, 'remove').and.returnValue(checkFormMock)
          controller = require('../../controllers/check-form').saveCheckForm
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
            expect(checkFormService.create).toHaveBeenCalled()
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
          spyOn(checkFormService, 'create').and.returnValue((Promise.resolve(checkFormMock)))
          spyOn(fs, 'remove').and.returnValue(checkFormMock)
          controller = require('../../controllers/check-form').saveCheckForm
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
            expect(checkFormService.create).not.toHaveBeenCalled()
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
          spyOn(checkFormService, 'create').and.returnValue(Promise.resolve(checkFormMock))
          spyOn(fs, 'remove').and.returnValue(checkFormMock)
          controller = require('../../controllers/check-form').saveCheckForm
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
            expect(checkFormService.create).not.toHaveBeenCalled()
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
          spyOn(checkFormService, 'create').and.returnValue(Promise.resolve(checkFormMock))
          spyOn(fs, 'remove').and.returnValue(checkFormMock)
          controller = require('../../controllers/check-form').saveCheckForm
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
            expect(checkFormService.create).not.toHaveBeenCalled()
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
          spyOn(checkFormService, 'getCheckForm').and.returnValue(checkFormMock)
          spyOn(checkWindowService, 'getCheckWindowsAssignedToFormsV2').and.returnValue([{
            id: 1,
            name: 'Window Test 1'
          },
          {
            id: 2,
            name: 'Window Test 1'
          }])
          spyOn(checkFormService, 'checkWindowNames').and.returnValue('Check Window 1')
          spyOn(checkFormService, 'canDelete').and.returnValue(false)
          controller = require('../../controllers/check-form').displayCheckForm
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
          expect(checkFormService.getCheckForm).toHaveBeenCalled()
          expect(checkWindowService.getCheckWindowsAssignedToFormsV2).toHaveBeenCalled()
          expect(checkFormService.checkWindowNames).toHaveBeenCalled()
          expect(checkFormService.canDelete).toHaveBeenCalled()
          expect(res.locals.pageTitle).toBe('View form')
          done()
        })
      })

      describe('Unhappy path - checkFormDataService.getActiveFormPlain fails', () => {
        beforeEach(() => {
          spyOn(checkFormService, 'getCheckForm').and.returnValue(Promise.reject(new Error('Error')))
          spyOn(checkWindowService, 'getCheckWindowsAssignedToForms').and.returnValue(checkFormsByWindowMock)
          spyOn(checkFormService, 'checkWindowNames').and.returnValue('Check Window 1')
          spyOn(checkFormService, 'canDelete').and.returnValue(false)
          controller = require('../../controllers/check-form').displayCheckForm
        })

        it('should redirect the user if #getActiveFormPlain fails', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.url = '/test-developer/view-form/29'
          await controller(req, res, next)
          expect(res.locals.pageTitle).toBe('View form')
          expect(checkFormService.getCheckForm).toHaveBeenCalled()
          expect(checkWindowService.getCheckWindowsAssignedToForms).not.toHaveBeenCalled()
          expect(checkFormService.checkWindowNames).not.toHaveBeenCalled()
          expect(res.statusCode).toBe(302)
          done()
        })
      })

      describe('Unhappy path - checkWindowService.getCheckWindowsAssignedToForms', () => {
        beforeEach(() => {
          spyOn(checkFormService, 'getCheckForm').and.returnValue(checkFormMock)
          spyOn(checkWindowService, 'getCheckWindowsAssignedToFormsV2').and.returnValue(Promise.reject(new Error('Error')))
          spyOn(checkFormService, 'checkWindowNames').and.returnValue('Check Window 1')
          spyOn(checkFormService, 'canDelete').and.returnValue(false)
          controller = require('../../controllers/check-form').displayCheckForm
        })

        it('should redirect the user if #getCheckWindowsAssignedToForms fails', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.url = '/test-developer/view-form/29'
          await controller(req, res, next)
          expect(res.locals.pageTitle).toBe('View form')
          expect(checkFormService.getCheckForm).toHaveBeenCalled()
          expect(checkWindowService.getCheckWindowsAssignedToFormsV2).toHaveBeenCalled()
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
          spyOn(checkFormService, 'getUnassignedFormsForCheckWindow').and.returnValue(checkFormsMock)
          controller = require('../../controllers/check-form').assignCheckFormsToWindowsPage
        })

        it('should render the correct page', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          spyOn(res, 'render').and.returnValue(null)
          req.url = '/test-developer/assign-form-to-window'
          await controller(req, res, next)
          expect(checkWindowService.getCurrentCheckWindowsAndCountForms).toHaveBeenCalled()
          expect(checkFormService.getUnassignedFormsForCheckWindow).toHaveBeenCalled()
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
          spyOn(checkFormService, 'getUnassignedFormsForCheckWindow').and.returnValue(checkFormsMock)
          controller = require('../../controllers/check-form').assignCheckFormsToWindowsPage
        })

        it('should render the correct page', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.url = '/test-developer/assign-form-to-window'

          await controller(req, res, next)
          expect(checkFormService.getUnassignedFormsForCheckWindow).toHaveBeenCalled()
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
          spyOn(checkWindowDataService, 'sqlFindOneById').and.returnValue(
            {
              id: 1,
              name: 'window 1'
            }
          )
          spyOn(checkFormService, 'getUnassignedFormsForCheckWindow').and.returnValue(checkWindowsMock)
          controller = require('../../controllers/check-form').assignCheckFormToWindowPage
        })

        it('should render the correct page', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          spyOn(res, 'render').and.returnValue(null)
          req.params.checkWindowId = '5a1ff0eefb8e09530d76976f'
          req.url = `/test-developer/assign-form-to-window/${req.params.checkWindowId}`

          await controller(req, res, next)
          expect(checkWindowDataService.sqlFindOneById).toHaveBeenCalled()
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
          spyOn(checkWindowDataService, 'sqlFindOneById').and.returnValue(Promise.reject(new Error('Error')))
          spyOn(checkFormService, 'getUnassignedFormsForCheckWindow').and.returnValue(checkWindowsMock)
          controller = require('../../controllers/check-form').assignCheckFormToWindowPage
        })

        it('should execute next', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          spyOn(res, 'render').and.returnValue(null)
          req.params.checkWindowId = '5a1ff0eefb8e09530d76976f'
          req.url = `/test-developer/assign-form-to-window/${req.params.checkWindowId}`

          try {
            await controller(req, res, next)
            expect(checkWindowDataService.sqlFindOneById).toHaveBeenCalled()
            expect(checkFormService.getUnassignedFormsForCheckWindow).not.toHaveBeenCalled()
            expect(res.locals.pageTitle).toBe('Assign forms')
            expect(res.statusCode).toBe(200)
            expect(next).toHaveBeenCalled()
            done()
          } catch (error) {
            expect(error).toBe('Error')
            done()
          }
        })
      })

      describe('#assignCheckFormToWindowPage - Unhappy path - When checkFormService.getUnassignedFormsForCheckWindow fails', () => {
        beforeEach(() => {
          spyOn(checkWindowDataService, 'sqlFindOneById').and.returnValue({
            id: 1,
            name: 'window 1'
          })
          spyOn(checkFormService, 'getUnassignedFormsForCheckWindow').and.returnValue(Promise.reject(new Error('Error')))
          controller = require('../../controllers/check-form').assignCheckFormToWindowPage
        })

        it('should execute next', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          spyOn(res, 'render').and.returnValue(null)
          req.params.checkWindowId = '5a1ff0eefb8e09530d76976f'
          req.url = `/test-developer/assign-form-to-window/${req.params.checkWindowId}`

          try {
            await controller(req, res, next)
            expect(checkWindowDataService.sqlFindOneById).toHaveBeenCalled()
            expect(checkFormService.getUnassignedFormsForCheckWindow).toHaveBeenCalled()
            expect(res.locals.pageTitle).toBe('Assign forms')
            expect(res.statusCode).toBe(200)
            expect(next).toHaveBeenCalled()
            done()
          } catch (error) {
            expect(error).toBe('Error')
            done()
          }
        })
      })
    })

    describe('#saveAssignCheckFormsToWindow - Save forms to chosen check window', () => {
      describe('Happy path', () => {
        beforeEach(() => {
          spyOn(checkWindowService, 'assignFormsToWindow').and.returnValue(Promise.resolve())
          controller = require('../../controllers/check-form').saveAssignCheckFormsToWindow
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

          await controller(req, res, next)
          expect(checkWindowService.assignFormsToWindow).toHaveBeenCalled()
          done()
        })
      })
    })

    describe('#unassignCheckFormsFromWindowPage - Render page to unassign check forms from check windows', () => {
      describe('Happy path', () => {
        beforeEach(() => {
          const assignedCheckForms = [
            { 'id': 100, 'name': 'MTC0100' }
          ]
          spyOn(checkWindowDataService, 'sqlFindOneById').and.returnValue(
            {
              id: 1,
              name: 'window 1'
            })
          spyOn(checkFormService, 'getAssignedFormsForCheckWindow').and.returnValue(assignedCheckForms)
          controller = require('../../controllers/check-form').unassignCheckFormsFromWindowPage
        })

        it('should render the correct page', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          spyOn(res, 'render').and.returnValue(null)
          req.params.checkWindowId = '5a1ff0eefb8e09530d76976f'
          req.url = `/test-developer/unassign-forms/${req.params.checkWindowId}`

          await controller(req, res, next)
          expect(checkWindowDataService.sqlFindOneById).toHaveBeenCalled()
          expect(checkFormService.getAssignedFormsForCheckWindow).toHaveBeenCalled()
          expect(res.render).toHaveBeenCalled()
          expect(res.locals.pageTitle).toBe('window 1')
          expect(res.statusCode).toBe(200)
          expect(next).not.toHaveBeenCalled()
          done()
        })
      })

      describe('Unhappy path - When checkWindowDataService.fetchCheckWindow', () => {
        beforeEach(() => {
          const assignedCheckForms = [
            {'_id': 100, 'name': 'MTC0100'}
          ]
          spyOn(checkWindowDataService, 'sqlFindOneById').and.returnValue(Promise.reject(new Error('Error')))
          spyOn(checkFormService, 'getAssignedFormsForCheckWindow').and.returnValue(assignedCheckForms)
          controller = require('../../controllers/check-form').unassignCheckFormsFromWindowPage
        })

        it('should execute next if #fetchCheckWindow fails', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          spyOn(res, 'render').and.returnValue(null)
          req.params.checkWindowId = '5a1ff0eefb8e09530d76976f'
          req.url = `/test-developer/unassign-forms/${req.params.checkWindowId}`

          await controller(req, res, next)
          expect(checkWindowDataService.sqlFindOneById).toHaveBeenCalled()
          expect(checkFormService.getAssignedFormsForCheckWindow).not.toHaveBeenCalled()
          expect(res.render).not.toHaveBeenCalled()
          expect(res.locals.pageTitle).toBe(undefined)
          expect(res.statusCode).toBe(200)
          expect(next).toHaveBeenCalled()
          done()
        })
      })
    })

    describe('Unhappy path - When checkFormService.getAssignedFormsForCheckWindow', () => {
      beforeEach(() => {
        spyOn(checkWindowDataService, 'sqlFindOneById').and.returnValue({
          id: 1,
          name: 'window 1'
        })
        spyOn(checkFormService, 'getAssignedFormsForCheckWindow').and.returnValue(Promise.reject(new Error('Error')))
        controller = require('../../controllers/check-form').unassignCheckFormsFromWindowPage
      })

      it('should execute next if #getAssignedFormsForCheckWindow fails', async (done) => {
        const res = getRes()
        const req = getReq(goodReqParams)
        spyOn(res, 'render').and.returnValue(null)
        req.params.checkWindowId = '5a1ff0eefb8e09530d76976f'
        req.url = `/test-developer/unassign-forms/${req.params.checkWindowId}`

        await controller(req, res, next)
        expect(checkWindowDataService.sqlFindOneById).toHaveBeenCalled()
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
        expect(checkWindowDataService.sqlFindOneById).not.toHaveBeenCalled()
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
          spyOn(checkFormService, 'removeWindowAssignment').and.returnValue(Promise.resolve())
          controller = require('../../controllers/check-form').unassignCheckFormFromWindow
        })

        it('should save and redirect the user', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.body.checkWindowId = '5a1ff0eefb8e09530d76976f'
          req.body.checkFormId = 101
          req.url = `/test-developer/unassign-form`

          await controller(req, res, next)
          expect(checkFormService.removeWindowAssignment).toHaveBeenCalled()
          expect(res.statusCode).toBe(302)
          expect(next).not.toHaveBeenCalled()
          done()
        })
      })

      describe('Unhappy path - checkFormService.removeWindowAssignment fails', () => {
        beforeEach(() => {
          spyOn(checkFormService, 'removeWindowAssignment').and.returnValue(Promise.reject(new Error()))
          controller = require('../../controllers/check-form').unassignCheckFormFromWindow
        })

        it('should execute next if #checkFormService.removeWindowAssignment fails', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.body.checkWindowId = '5a1ff0eefb8e09530d76976f'
          req.body.checkFormId = 101
          req.url = `/test-developer/unassign-form`

          await controller(req, res, next)
          expect(checkFormService.removeWindowAssignment).toHaveBeenCalled()
          expect(res.statusCode).toBe(302)
          expect(next).toHaveBeenCalled()
          done()
        })
      })

      describe('Unhappy path(s) - checkWindowDataService.create fails or req.body is incomplete', () => {
        beforeEach(() => {
          spyOn(checkFormService, 'removeWindowAssignment').and.returnValue(Promise.resolve())
          controller = require('../../controllers/check-form').unassignCheckFormFromWindow
        })

        it('should redirect the user and show a flash message if #checkWindowDataService.create fails', async (done) => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.body.checkWindowId = '5a1ff0eefb8e09530d76976f'
          req.body.checkFormId = 101
          req.url = `/test-developer/unassign-form`

          await controller(req, res, next)
          expect(checkFormService.removeWindowAssignment).toHaveBeenCalled()
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
          expect(checkFormService.removeWindowAssignment).not.toHaveBeenCalled()
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
          expect(checkFormService.removeWindowAssignment).not.toHaveBeenCalled()
          expect(req.flash).toBeTruthy()
          expect(res.statusCode).toBe(302)
          done()
        })
      })
    })
  })
})
