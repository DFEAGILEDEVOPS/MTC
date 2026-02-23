'use strict'

const httpMocks = require('node-mocks-http')

const checkWindowV2Service = require('../../../services/check-window-v2.service')
const ValidationError = require('../../../lib/validation-error')
const groupService = require('../../../services/group.service')
const groupValidator = require('../../../lib/validator/group-validator')
const groupMock = require('../mocks/group')
const groupsMock = require('../mocks/groups')
const groupDeletedMock = require('../mocks/group-deleted')
const pupilsMock = require('../mocks/pupils-with-reason')
const schoolHomeFeatureEligibilityPresenter = require('../../../helpers/school-home-feature-eligibility-presenter')
const businessAvailabilityService = require('../../../services/business-availability.service')

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
    req.breadcrumbs = jest.fn()
    req.flash = jest.fn()
    return req
  }

  describe('Check routes', () => {
    let controllerMethodUnderTest
    let next
    const goodReqParams = {
      method: 'GET',
      url: '/group/pupils-list'
    }

    beforeEach(() => {
      next = jest.fn()
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    describe('#groupPupilsPage', () => {
      describe('(happy path)', () => {
        beforeEach(() => {
          jest.spyOn(groupService, 'getGroups').mockResolvedValue(groupsMock)
          controllerMethodUnderTest = require('../../../controllers/group')
        })

        test('should render the initial groups page', async () => {
          const res = getRes()
          const req = getReq(goodReqParams)
          jest.spyOn(res, 'render').mockImplementation()
          jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
          jest.spyOn(schoolHomeFeatureEligibilityPresenter, 'getPresentationData').mockImplementation()
          jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({})
          await controllerMethodUnderTest.groupPupilsPage(req, res, next)

          expect(res.locals.pageTitle).toBe('Organise pupils into groups')
          expect(groupService.getGroups).toHaveBeenCalled()
          expect(next).not.toHaveBeenCalled()
          expect(res.render).toHaveBeenCalled()
          expect(res.statusCode).toBe(200)
          expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
          expect(businessAvailabilityService.getAvailabilityData).toHaveBeenCalled()
          expect(schoolHomeFeatureEligibilityPresenter.getPresentationData).toHaveBeenCalled()
        })
      })

      describe('(unhappy path)', () => {
        beforeEach(() => {
          jest.spyOn(groupService, 'getGroups').mockRejectedValue(new Error())
          controllerMethodUnderTest = require('../../../controllers/group').groupPupilsPage
        })

        test('should render the initial groups page', async () => {
          const res = getRes()
          const req = getReq(goodReqParams)
          jest.spyOn(res, 'render').mockImplementation()
          jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
          jest.spyOn(schoolHomeFeatureEligibilityPresenter, 'getPresentationData').mockImplementation()
          jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({})
          await controllerMethodUnderTest(req, res, next)

          expect(res.locals.pageTitle).toBe('Organise pupils into groups')
          expect(groupService.getGroups).toHaveBeenCalled()
          expect(next).toHaveBeenCalled()
          expect(res.render).toHaveBeenCalled()
          expect(res.statusCode).toBe(200)
          expect(checkWindowV2Service.getActiveCheckWindow).not.toHaveBeenCalled()
          expect(businessAvailabilityService.getAvailabilityData).not.toHaveBeenCalled()
          expect(schoolHomeFeatureEligibilityPresenter.getPresentationData).not.toHaveBeenCalled()
        })
      })
    })

    describe('#manageGroupPage', () => {
      describe('(happy path)', () => {
        beforeEach(() => {
          jest.spyOn(groupService, 'getGroupById').mockResolvedValue(groupMock)
          jest.spyOn(groupService, 'getPupils').mockResolvedValue(pupilsMock)
          controllerMethodUnderTest = require('../../../controllers/group').manageGroupPage
        })

        test('should render the add page', async () => {
          const res = getRes()
          const req = getReq(goodReqParams)
          jest.spyOn(res, 'render').mockImplementation()
          jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
          jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({ groupsAvailable: true })
          await controllerMethodUnderTest(req, res, next)

          expect(res.locals.pageTitle).toBe('Create group')
          expect(groupService.getGroupById).not.toHaveBeenCalled()
          expect(groupService.getPupils).toHaveBeenCalled()
          expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
          expect(businessAvailabilityService.getAvailabilityData).toHaveBeenCalled()
          expect(next).not.toHaveBeenCalled()
          expect(res.render).toHaveBeenCalled()
          expect(res.statusCode).toBe(200)
        })

        test('should render the edit page', async () => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.params.groupId = '123456abcde'
          jest.spyOn(res, 'render').mockImplementation()
          jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
          jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({ groupsAvailable: true })
          await controllerMethodUnderTest(req, res, next)

          expect(res.locals.pageTitle).toBe('Edit group')
          expect(groupService.getGroupById).toHaveBeenCalled()
          expect(groupService.getPupils).toHaveBeenCalled()
          expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
          expect(businessAvailabilityService.getAvailabilityData).toHaveBeenCalled()
          expect(next).not.toHaveBeenCalled()
          expect(res.render).toHaveBeenCalled()
          expect(res.statusCode).toBe(200)
        })
      })

      describe('(happy path) #2', () => {
        beforeEach(() => {
          jest.spyOn(groupService, 'getGroupById').mockResolvedValue(groupMock)
          jest.spyOn(groupService, 'getPupils').mockResolvedValue(pupilsMock)
          controllerMethodUnderTest = require('../../../controllers/group').manageGroupPage
        })

        test('should render the add page', async () => {
          const res = getRes()
          const req = getReq(goodReqParams)
          jest.spyOn(res, 'render').mockImplementation()
          jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
          jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({ groupsAvailable: true })
          await controllerMethodUnderTest(req, res, next)

          expect(res.locals.pageTitle).toBe('Create group')
          expect(groupService.getGroupById).not.toHaveBeenCalled()
          expect(groupService.getPupils).toHaveBeenCalled()
          expect(next).not.toHaveBeenCalled()
          expect(res.render).toHaveBeenCalled()
          expect(res.statusCode).toBe(200)
        })

        test('should render the edit page', async () => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.params.groupId = '123456abcde'
          jest.spyOn(res, 'render').mockImplementation()
          jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
          jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({ groupsAvailable: true })
          await controllerMethodUnderTest(req, res, next)

          expect(res.locals.pageTitle).toBe('Edit group')
          expect(groupService.getGroupById).toHaveBeenCalled()
          expect(groupService.getPupils).toHaveBeenCalled()
          expect(next).not.toHaveBeenCalled()
          expect(res.render).toHaveBeenCalled()
          expect(res.statusCode).toBe(200)
        })
      })

      describe('(unhappy path)', () => {
        beforeEach(() => {
          jest.spyOn(groupService, 'getGroupById').mockResolvedValue(Promise.reject(new Error()))
          jest.spyOn(groupService, 'getPupils').mockResolvedValue(pupilsMock)
          controllerMethodUnderTest = require('../../../controllers/group').manageGroupPage
        })

        test('should fail to render the edit page and execute next', async () => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.params.groupId = '123456abcde'
          jest.spyOn(res, 'render').mockImplementation()
          jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
          jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({ groupsAvailable: true })
          await controllerMethodUnderTest(req, res, next)

          expect(res.locals.pageTitle).toBe('Edit group')
          expect(groupService.getGroupById).toHaveBeenCalled()
          expect(groupService.getPupils).not.toHaveBeenCalled()
          expect(next).toHaveBeenCalled()
          expect(res.render).not.toHaveBeenCalled()
          expect(res.statusCode).toBe(200)
        })
      })

      describe('(unhappy path) #2', () => {
        beforeEach(() => {
          jest.spyOn(groupService, 'getGroupById').mockResolvedValue(groupMock)
          jest.spyOn(groupService, 'getPupils').mockResolvedValue(Promise.reject(new Error()))
          controllerMethodUnderTest = require('../../../controllers/group').manageGroupPage
        })

        test('should fail to render the add page and execute next', async () => {
          const res = getRes()
          const req = getReq(goodReqParams)
          jest.spyOn(res, 'render').mockImplementation()
          jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
          jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({ groupsAvailable: true })
          await controllerMethodUnderTest(req, res, next)

          expect(res.locals.pageTitle).toBe('Create group')
          expect(groupService.getGroupById).not.toHaveBeenCalled()
          expect(groupService.getPupils).toHaveBeenCalled()
          expect(next).toHaveBeenCalled()
          expect(res.render).not.toHaveBeenCalled()
          expect(res.statusCode).toBe(200)
        })
      })
    })

    describe('#addGroup', () => {
      describe('(happy path)', () => {
        test('should create a new group', async () => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.method = 'POST'
          req.body = {
            name: 'Test Group 1',
            pupil: ['5a324c40c9decb39628b84a2', '5a324c40c9decb39628b84a3', '5a324c40c9decb39628b84a4']
          }

          const validationError = new ValidationError()
          jest.spyOn(groupValidator, 'validate').mockResolvedValue(validationError)
          jest.spyOn(groupService, 'getPupils').mockResolvedValue(pupilsMock)
          jest.spyOn(groupService, 'create').mockResolvedValue(groupMock)
          jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
          jest.spyOn(businessAvailabilityService, 'determineGroupsEligibility').mockImplementation()

          controllerMethodUnderTest = require('../../../controllers/group').addGroup
          await controllerMethodUnderTest(req, res, next)

          expect(validationError.hasError()).toBeFalsy()
          expect(groupValidator.validate).toHaveBeenCalled()
          expect(groupService.getPupils).not.toHaveBeenCalled()
          expect(groupService.create).toHaveBeenCalled()
          expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
          expect(businessAvailabilityService.determineGroupsEligibility).toHaveBeenCalled()
          expect(next).not.toHaveBeenCalled()
          expect(res.statusCode).toBe(302)
        })
      })

      describe('(unhappy path)', () => {
        test('should fail to create a new group', async () => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.method = 'POST'
          req.body = {
            name: 'Test Group 1',
            pupil: ['5a324c40c9decb39628b84a2', '5a324c40c9decb39628b84a3', '5a324c40c9decb39628b84a4']
          }

          const validationError = new ValidationError()
          jest.spyOn(groupValidator, 'validate').mockResolvedValue(validationError)
          jest.spyOn(groupService, 'getPupils').mockResolvedValue(pupilsMock)
          jest.spyOn(groupService, 'create').mockRejectedValue(new Error())
          jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
          jest.spyOn(businessAvailabilityService, 'determineGroupsEligibility').mockImplementation()

          controllerMethodUnderTest = require('../../../controllers/group').addGroup
          await controllerMethodUnderTest(req, res, next)

          expect(validationError.hasError()).toBeFalsy()
          expect(groupValidator.validate).toHaveBeenCalled()
          expect(groupService.getPupils).not.toHaveBeenCalled()
          expect(groupService.create).toHaveBeenCalled()
          expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
          expect(businessAvailabilityService.determineGroupsEligibility).toHaveBeenCalled()
          expect(next).toHaveBeenCalled()
          expect(res.statusCode).toBe(200)
        })
      })

      describe('(unhappy path) #2', () => {
        test('should fail when form has errors', async () => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.method = 'POST'
          req.body = {
            name: 'T',
            pupil: ['5a324c40c9decb39628b84a2']
          }

          const validationError = new ValidationError()
          validationError.addError('test', 'test')

          jest.spyOn(groupValidator, 'validate').mockResolvedValue(validationError)
          jest.spyOn(groupService, 'getPupils').mockResolvedValue(groupMock)
          jest.spyOn(groupService, 'create').mockResolvedValue(groupMock)
          jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
          jest.spyOn(businessAvailabilityService, 'determineGroupsEligibility').mockImplementation()

          controllerMethodUnderTest = require('../../../controllers/group').addGroup
          await controllerMethodUnderTest(req, res, next)

          expect(res.locals.pageTitle).toBe('Create group')
          expect(validationError.hasError()).toBeTruthy()
          expect(groupValidator.validate).toHaveBeenCalled()
          expect(groupService.getPupils).toHaveBeenCalled()
          expect(groupService.create).not.toHaveBeenCalled()
          expect(next).not.toHaveBeenCalled()
          expect(res.statusCode).toBe(200)
        })
      })

      describe('(unhappy path) #3', () => {
        test('should fail when getPupils fails', async () => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.method = 'POST'
          req.body = {
            name: 'T',
            pupil: ['5a324c40c9decb39628b84a2']
          }

          const validationError = new ValidationError()
          validationError.addError('test', 'test')

          jest.spyOn(groupValidator, 'validate').mockResolvedValue(validationError)
          jest.spyOn(groupService, 'getPupils').mockRejectedValue(new Error())
          jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
          jest.spyOn(businessAvailabilityService, 'determineGroupsEligibility').mockImplementation()

          controllerMethodUnderTest = require('../../../controllers/group').addGroup
          await controllerMethodUnderTest(req, res, next)

          expect(res.locals.pageTitle).toBe('Create group')
          expect(validationError.hasError()).toBeTruthy()
          expect(groupValidator.validate).toHaveBeenCalled()
          expect(groupService.getPupils).toHaveBeenCalled()
          expect(next).toHaveBeenCalled()
          expect(res.statusCode).toBe(200)
        })
      })

      describe('(unhappy path) #4', () => {
        beforeEach(() => {
          jest.spyOn(groupValidator, 'validate').mockResolvedValue()
          jest.spyOn(groupService, 'getPupils').mockResolvedValue(pupilsMock)
          jest.spyOn(groupService, 'create').mockResolvedValue(groupMock)
          controllerMethodUnderTest = require('../../../controllers/group').addGroup
        })

        test('should redirect when name and/or pupil body are empty', async () => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.method = 'POST'
          req.body = {
            name: '',
            pupil: null
          }

          await controllerMethodUnderTest(req, res, next)
          expect(res.locals.pageTitle).toBeUndefined()
          expect(groupValidator.validate).not.toHaveBeenCalled()
          expect(groupService.getPupils).not.toHaveBeenCalled()
          expect(groupService.create).not.toHaveBeenCalled()
          expect(next).not.toHaveBeenCalled()
          expect(res.statusCode).toBe(302)
        })
      })
    })

    describe('#editGroup', () => {
      describe('(happy path)', () => {
        test('should edit a group', async () => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.method = 'POST'
          req.body = {
            name: 'Test Group 1',
            pupil: ['5a324c40c9decb39628b84a2', '5a324c40c9decb39628b84a3', '5a324c40c9decb39628b84a4'],
            groupId: '123456abcde'
          }

          const validationError = new ValidationError()
          jest.spyOn(groupService, 'getGroupById').mockResolvedValue(groupMock)
          jest.spyOn(groupService, 'getPupils').mockResolvedValue(pupilsMock)
          jest.spyOn(groupValidator, 'validate').mockResolvedValue(validationError)
          jest.spyOn(groupService, 'update').mockResolvedValue(groupMock)
          jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
          jest.spyOn(businessAvailabilityService, 'determineGroupsEligibility').mockImplementation()

          controllerMethodUnderTest = require('../../../controllers/group').editGroup
          await controllerMethodUnderTest(req, res, next)

          expect(validationError.hasError()).toBeFalsy()
          expect(groupService.getGroupById).toHaveBeenCalled()
          expect(groupValidator.validate).toHaveBeenCalled()
          expect(groupService.getPupils).not.toHaveBeenCalled()
          expect(groupService.update).toHaveBeenCalled()
          expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
          expect(businessAvailabilityService.determineGroupsEligibility).toHaveBeenCalled()
          expect(next).not.toHaveBeenCalled()
          expect(res.statusCode).toBe(302)
        })
      })

      describe('(unhappy path)', () => {
        test('should redirect the user when req.body is incomplete', async () => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.method = 'POST'
          req.body = {
            name: '',
            pupil: null,
            groupId: '123456abcde'
          }

          const validationError = new ValidationError()
          jest.spyOn(groupService, 'getGroupById').mockResolvedValue(groupMock)
          jest.spyOn(groupService, 'getPupils').mockResolvedValue(pupilsMock)
          jest.spyOn(groupValidator, 'validate').mockResolvedValue(validationError)
          jest.spyOn(groupService, 'update').mockRejectedValue(groupMock)

          controllerMethodUnderTest = require('../../../controllers/group').editGroup
          await controllerMethodUnderTest(req, res, next)

          expect(validationError.hasError()).toBeFalsy()
          expect(groupService.getGroupById).not.toHaveBeenCalled()
          expect(groupValidator.validate).not.toHaveBeenCalled()
          expect(groupService.getPupils).not.toHaveBeenCalled()
          expect(groupService.update).not.toHaveBeenCalled()
          expect(next).not.toHaveBeenCalled()
          expect(res.statusCode).toBe(302)
        })
      })

      describe('(unhappy path) #2', () => {
        test('should execute next when getGroupById fails', async () => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.method = 'POST'
          req.body = {
            name: 'Test Group 1',
            pupil: ['5a324c40c9decb39628b84a2', '5a324c40c9decb39628b84a3', '5a324c40c9decb39628b84a4'],
            groupId: '123456abcde'
          }

          const validationError = new ValidationError()
          jest.spyOn(groupService, 'getGroupById').mockRejectedValue(new Error())
          jest.spyOn(groupService, 'getPupils').mockResolvedValue(pupilsMock)
          jest.spyOn(groupValidator, 'validate').mockResolvedValue(validationError)
          jest.spyOn(groupService, 'update').mockResolvedValue(groupMock)
          jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
          jest.spyOn(businessAvailabilityService, 'determineGroupsEligibility').mockImplementation()

          controllerMethodUnderTest = require('../../../controllers/group').editGroup
          await controllerMethodUnderTest(req, res, next)

          expect(validationError.hasError()).toBeFalsy()
          expect(groupService.getGroupById).toHaveBeenCalled()
          expect(groupValidator.validate).not.toHaveBeenCalled()
          expect(groupService.getPupils).not.toHaveBeenCalled()
          expect(groupService.update).not.toHaveBeenCalled()
          expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
          expect(businessAvailabilityService.determineGroupsEligibility).toHaveBeenCalled()
          expect(next).toHaveBeenCalled()
          expect(res.statusCode).toBe(200)
        })
      })

      describe('(unhappy path) #3', () => {
        test('should execute next when form validation fails', async () => {
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

          jest.spyOn(groupService, 'getGroupById').mockResolvedValue(groupMock)
          jest.spyOn(groupService, 'getPupils').mockResolvedValue(pupilsMock)
          jest.spyOn(groupValidator, 'validate').mockResolvedValue(validationError)
          jest.spyOn(groupService, 'update').mockResolvedValue(groupMock)
          jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
          jest.spyOn(businessAvailabilityService, 'determineGroupsEligibility').mockImplementation()

          controllerMethodUnderTest = require('../../../controllers/group').editGroup
          await controllerMethodUnderTest(req, res, next)

          expect(res.locals.pageTitle).toBe('Edit group')
          expect(validationError.hasError()).toBeTruthy()
          expect(groupService.getGroupById).toHaveBeenCalled()
          expect(groupValidator.validate).toHaveBeenCalled()
          expect(groupService.getPupils).toHaveBeenCalled()
          expect(groupService.update).not.toHaveBeenCalled()
          expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
          expect(businessAvailabilityService.determineGroupsEligibility).toHaveBeenCalled()
          expect(next).not.toHaveBeenCalled()
          expect(res.statusCode).toBe(200)
        })
      })

      describe('(unhappy path) #4', () => {
        test('should execute next when getPupils fails', async () => {
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

          jest.spyOn(groupService, 'getGroupById').mockResolvedValue(groupMock)
          jest.spyOn(groupService, 'getPupils').mockRejectedValue(new Error())
          jest.spyOn(groupValidator, 'validate').mockResolvedValue(validationError)
          jest.spyOn(groupService, 'update').mockResolvedValue(groupMock)
          jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
          jest.spyOn(businessAvailabilityService, 'determineGroupsEligibility').mockImplementation()

          controllerMethodUnderTest = require('../../../controllers/group').editGroup
          await controllerMethodUnderTest(req, res, next)

          expect(res.locals.pageTitle).toBeUndefined()
          expect(validationError.hasError()).toBeTruthy()
          expect(groupService.getGroupById).toHaveBeenCalled()
          expect(groupValidator.validate).toHaveBeenCalled()
          expect(groupService.getPupils).toHaveBeenCalled()
          expect(groupService.update).not.toHaveBeenCalled()
          expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
          expect(businessAvailabilityService.determineGroupsEligibility).toHaveBeenCalled()
          expect(next).toHaveBeenCalled()
          expect(res.statusCode).toBe(200)
        })
      })

      describe('(unhappy path) #5', () => {
        test('should execute next when update fails', async () => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.method = 'POST'
          req.body = {
            name: 'Test Group 1',
            pupil: ['5a324c40c9decb39628b84a2', '5a324c40c9decb39628b84a3', '5a324c40c9decb39628b84a4'],
            groupId: '123456abcde'
          }

          const validationError = new ValidationError()

          jest.spyOn(groupService, 'getGroupById').mockResolvedValue(groupMock)
          jest.spyOn(groupService, 'getPupils').mockResolvedValue(pupilsMock)
          jest.spyOn(groupValidator, 'validate').mockResolvedValue(validationError)
          jest.spyOn(groupService, 'update').mockRejectedValue(new Error())
          jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
          jest.spyOn(businessAvailabilityService, 'determineGroupsEligibility').mockImplementation()

          controllerMethodUnderTest = require('../../../controllers/group').editGroup
          await controllerMethodUnderTest(req, res, next)

          expect(res.locals.pageTitle).toBeUndefined()
          expect(validationError.hasError()).toBeFalsy()
          expect(groupService.getGroupById).toHaveBeenCalled()
          expect(groupValidator.validate).toHaveBeenCalled()
          expect(groupService.getPupils).not.toHaveBeenCalled()
          expect(groupService.update).toHaveBeenCalled()
          expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
          expect(businessAvailabilityService.determineGroupsEligibility).toHaveBeenCalled()
          expect(next).toHaveBeenCalled()
          expect(res.statusCode).toBe(200)
        })
      })
    })

    describe('#removeGroup', () => {
      describe('(happy path)', () => {
        test('should soft-delete a group', async () => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.method = 'GET'
          req.params = {
            groupId: '123456abcde'
          }

          jest.spyOn(groupService, 'remove').mockResolvedValue(groupDeletedMock)
          jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
          jest.spyOn(businessAvailabilityService, 'determineGroupsEligibility').mockImplementation()

          controllerMethodUnderTest = require('../../../controllers/group').removeGroup
          await controllerMethodUnderTest(req, res, next)

          expect(groupService.remove).toHaveBeenCalled()
          expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
          expect(businessAvailabilityService.determineGroupsEligibility).toHaveBeenCalled()
          expect(next).not.toHaveBeenCalled()
          expect(res.statusCode).toBe(302)
        })
      })

      describe('(unhappy path - missing parameter group id)', () => {
        test('should soft-delete a group', async () => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.method = 'GET'
          req.params = {
            groupId: null
          }

          jest.spyOn(groupService, 'remove').mockResolvedValue(groupDeletedMock)
          jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
          jest.spyOn(businessAvailabilityService, 'determineGroupsEligibility').mockImplementation()

          controllerMethodUnderTest = require('../../../controllers/group').removeGroup
          await controllerMethodUnderTest(req, res, next)

          expect(groupService.remove).not.toHaveBeenCalled()
          expect(next).not.toHaveBeenCalled()
          expect(res.statusCode).toBe(302)
        })
      })

      describe('(unhappy path - soft-delete fails )', () => {
        test('should soft-delete a group', async () => {
          const res = getRes()
          const req = getReq(goodReqParams)
          req.method = 'GET'
          req.params = {
            groupId: '123456abcde'
          }

          jest.spyOn(groupService, 'remove').mockRejectedValue(new Error())
          jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
          jest.spyOn(businessAvailabilityService, 'determineGroupsEligibility').mockImplementation()

          controllerMethodUnderTest = require('../../../controllers/group').removeGroup
          await controllerMethodUnderTest(req, res, next)

          expect(groupService.remove).toHaveBeenCalled()
          expect(next).toHaveBeenCalled()
          expect(res.statusCode).toBe(200)
        })
      })
    })
  })
})
