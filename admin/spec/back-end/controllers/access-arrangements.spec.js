'use strict'

const httpMocks = require('node-mocks-http')
const R = require('ramda')

const checkWindowV2Service = require('../../../services/check-window-v2.service')
const controller = require('../../../controllers/access-arrangements')
const accessArrangementsService = require('../../../services/access-arrangements.service')
const pupilAccessArrangementsService = require('../../../services/pupil-access-arrangements.service')
const pupilAccessArrangementsEditService = require('../../../services/pupil-access-arrangements-edit.service')
const schoolHomeFeatureEligibilityPresenter = require('../../../helpers/school-home-feature-eligibility-presenter')
const accessArrangementsOverviewPresenter = require('../../../helpers/access-arrangements-overview-presenter')
const businessAvailabilityService = require('../../../services/business-availability.service')
const ValidationError = require('../../../lib/validation-error')
const accessArrangementsDescriptionsPresenter = require('../../../helpers/access-arrangements-descriptions-presenter')
const aaViewModes = require('../../../lib/consts/access-arrangements-view-mode')
const { AccessArrangementsNotEditableError } = require('../../../error-types/access-arrangements-not-editable-error')
const moment = require('moment')
const uuid = require('uuid')
const headteacherDeclarationService = require('../../../services/headteacher-declaration.service')

describe('access arrangements controller:', () => {
  let next

  function getRes () {
    const res = httpMocks.createResponse()
    res.locals = {}
    return res
  }

  function getReq (params) {
    const req = httpMocks.createRequest(params)
    req.user = { School: 9991001 }
    req.breadcrumbs = jest.fn()
    req.flash = jest.fn()
    return req
  }

  beforeEach(() => {
    next = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getOverview route', () => {
    const reqParams = {
      method: 'GET',
      url: '/access-arrangements/overview',
      user: {
        schoolId: 7
      }
    }

    test('displays the access arrangements overview page', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(res, 'render').mockImplementation()
      jest.spyOn(accessArrangementsService, 'getCurrentViewMode').mockResolvedValue(aaViewModes.edit)
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
      jest.spyOn(schoolHomeFeatureEligibilityPresenter, 'getPresentationData').mockImplementation()
      jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({ accessArrangementsAvailable: true })
      jest.spyOn(pupilAccessArrangementsService, 'getPupils').mockResolvedValue([])
      jest.spyOn(accessArrangementsOverviewPresenter, 'getPresentationData').mockImplementation()
      await controller.getOverview(req, res, next)
      expect(res.locals.pageTitle).toBe('Enable access arrangements for pupils who need them')
      expect(res.render).toHaveBeenCalled()
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(businessAvailabilityService.getAvailabilityData).toHaveBeenCalled()
      expect(accessArrangementsService.getCurrentViewMode).toHaveBeenCalled()
      expect(schoolHomeFeatureEligibilityPresenter.getPresentationData).toHaveBeenCalled()
      expect(accessArrangementsOverviewPresenter.getPresentationData).toHaveBeenCalled()
    })

    test('displays the access arrangements unavailable page when the feature is not accessible', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(res, 'render').mockImplementation()
      jest.spyOn(pupilAccessArrangementsService, 'getPupils').mockResolvedValue([])
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
      jest.spyOn(schoolHomeFeatureEligibilityPresenter, 'getPresentationData').mockImplementation()
      jest.spyOn(accessArrangementsService, 'getCurrentViewMode').mockResolvedValue(aaViewModes.unavailable)
      jest.spyOn(accessArrangementsOverviewPresenter, 'getPresentationData').mockImplementation()
      jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockImplementation()
      await controller.getOverview(req, res, next)
      expect(res.render).toHaveBeenCalledWith('access-arrangements/unavailable-access-arrangements', {
        aaViewMode: aaViewModes.unavailable,
        breadcrumbs: undefined,
        title: 'Enable access arrangements for pupils who need them'
      })
    })

    test('displays the overview in readonly mode when editing is no longer permitted', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(res, 'render').mockImplementation()
      jest.spyOn(pupilAccessArrangementsService, 'getPupils').mockResolvedValue([])
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
      jest.spyOn(accessArrangementsService, 'getCurrentViewMode').mockResolvedValue(aaViewModes.readonly)
      jest.spyOn(schoolHomeFeatureEligibilityPresenter, 'getPresentationData').mockImplementation()
      jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({ accessArrangementsAvailable: true })
      jest.spyOn(accessArrangementsOverviewPresenter, 'getPresentationData').mockImplementation()
      await controller.getOverview(req, res, next)
      expect(res.render).toHaveBeenCalledWith('access-arrangements/overview', {
        aaViewMode: aaViewModes.readonly,
        availabilityData: {
          accessArrangementsAvailable: true
        },
        messages: undefined,
        pinGenerationEligibilityData: undefined,
        pupilsFormatted: undefined,
        breadcrumbs: undefined,
        highlight: undefined,
        title: 'Enable access arrangements for pupils who need them',
        retroInputAssistantText: ''
      })
    })

    test('throws an error if pupilAccessArrangementsService getPupils is rejected', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(res, 'render').mockImplementation()
      jest.spyOn(accessArrangementsService, 'getCurrentViewMode').mockResolvedValue(aaViewModes.edit)
      jest.spyOn(pupilAccessArrangementsService, 'getPupils').mockResolvedValue(Promise.reject(new Error('error')))
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
      jest.spyOn(schoolHomeFeatureEligibilityPresenter, 'getPresentationData').mockImplementation()
      jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockImplementation()
      try {
        await controller.getOverview(req, res, next)
      } catch (error) {
        expect(error.message).toBe('error')
      }
    })

    test('does not display the retro input assistant link when the live check window is not active', async () => {
      // Mock the date
      setupFakeTime(moment('2021-04-21T09:00:00'))

      const res = getRes()
      const req = getReq()

      // Mock the checkWindow, so that the Try it out phase it active, but not the live check
      const checkWindow = {
        id: 1,
        createdAt: moment('2021-04-22T10:25:55Z'),
        updatedAt: moment('2021-04-22T13:33:05Z'),
        name: 'Test',
        adminStartDate: moment('2021-04-19T00:00:00Z'),
        checkStartDate: moment('2021-06-07T00:00:00Z'),
        checkEndDate: moment('2021-06-25T23:59:59Z'),
        isDeleted: false,
        urlSlug: uuid.NIL,
        adminEndDate: moment('2021-07-30T23:59:59Z'),
        familiarisationCheckStartDate: moment('2021-04-19T00:00:00Z'),
        familiarisationCheckEndDate: moment('2021-06-25T23:59:59Z')
      }
      jest.spyOn(accessArrangementsService, 'getCurrentViewMode').mockResolvedValue(aaViewModes.edit)
      jest.spyOn(pupilAccessArrangementsService, 'getPupils').mockResolvedValue([])
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockResolvedValue(checkWindow)
      jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({ accessArrangementsAvailable: true })
      jest.spyOn(headteacherDeclarationService, 'isHdfSubmittedForCheck').mockResolvedValue(false)

      await controller.getOverview(req, res, next)
      const data = res._getRenderData()
      expect(data.retroInputAssistantText).toBe('')
      tearDownFakeTime()
    })

    test('displays the retro input assistant link when the live check window is active', async () => {
      // Mock the date
      setupFakeTime(moment('2021-06-07T06:00:00Z'))

      const res = getRes()
      const req = getReq()
      req.user.schoolId = 1 // assign a school to the user
      req.user.timezone = 'Europe/London'

      // Mock the checkWindow, so that the Try it out phase it active, but not the live check
      const checkWindow = {
        id: 1,
        createdAt: moment('2021-04-22T10:25:55Z'),
        updatedAt: moment('2021-04-22T13:33:05Z'),
        name: 'Test',
        adminStartDate: moment('2021-04-19T00:00:00Z'),
        checkStartDate: moment('2021-06-07T00:00:00Z'),
        checkEndDate: moment('2021-06-25T23:59:59Z'),
        isDeleted: false,
        urlSlug: uuid.NIL,
        adminEndDate: moment('2021-07-30T23:59:59Z'),
        familiarisationCheckStartDate: moment('2021-04-19T00:00:00Z'),
        familiarisationCheckEndDate: moment('2021-06-25T23:59:59Z')
      }
      jest.spyOn(accessArrangementsService, 'getCurrentViewMode').mockResolvedValue(aaViewModes.edit)
      jest.spyOn(pupilAccessArrangementsService, 'getPupils').mockResolvedValue([])
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockResolvedValue(checkWindow)
      // headTeacherDeclarationService used by getAvailabilityData()
      jest.spyOn(headteacherDeclarationService, 'isHdfSubmittedForCheck').mockResolvedValue(false)

      await controller.getOverview(req, res, next)
      const data = res._getRenderData()
      expect(data.retroInputAssistantText).toContain('/access-arrangements/retro-add-input-assistant')
      tearDownFakeTime()
    })
  })

  describe('getSelectAccessArrangements route', () => {
    const reqParams = {
      method: 'GET',
      url: '/access-arrangements/select-access-arrangements'
    }

    test('displays the select access arrangements page', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(res, 'render').mockImplementation()
      jest.spyOn(accessArrangementsService, 'getAccessArrangements').mockImplementation()
      jest.spyOn(accessArrangementsDescriptionsPresenter, 'getPresentationData').mockImplementation()
      jest.spyOn(accessArrangementsDescriptionsPresenter, 'addReasonRequiredIndication').mockImplementation()
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
      jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockResolvedValue({ accessArrangementsAvailable: true })
      jest.spyOn(pupilAccessArrangementsService, 'getEligiblePupilsWithFullNames').mockImplementation()
      await controller.getSelectAccessArrangements(req, res, next)
      expect(res.locals.pageTitle).toBe('Select access arrangement for pupil')
      expect(res.render).toHaveBeenCalled()
      expect(accessArrangementsService.getAccessArrangements).toHaveBeenCalled()
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(businessAvailabilityService.getAvailabilityData).toHaveBeenCalled()
      expect(pupilAccessArrangementsService.getEligiblePupilsWithFullNames).toHaveBeenCalled()
    })
    test('calls next when an error occurs during service call', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(res, 'render')
      const error = new Error('error')
      jest.spyOn(accessArrangementsService, 'getAccessArrangements').mockResolvedValue(Promise.reject(error))
      jest.spyOn(accessArrangementsDescriptionsPresenter, 'getPresentationData').mockImplementation()
      jest.spyOn(accessArrangementsDescriptionsPresenter, 'addReasonRequiredIndication').mockImplementation()
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
      jest.spyOn(businessAvailabilityService, 'getAvailabilityData').mockImplementation()
      jest.spyOn(pupilAccessArrangementsService, 'getEligiblePupilsWithFullNames').mockImplementation()
      await controller.getSelectAccessArrangements(req, res, next)
      expect(res.render).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
      expect(pupilAccessArrangementsService.getEligiblePupilsWithFullNames).not.toHaveBeenCalled()
      expect(businessAvailabilityService.getAvailabilityData).not.toHaveBeenCalled()
    })
  })

  describe('postSubmitAccessArrangements route', () => {
    const reqParams = {
      method: 'POST',
      url: '/access-arrangements/submit',
      body: {},
      user: {
        id: 1,
        School: 1
      }
    }
    test('should fail when edit mode unavailable', async () => {
      jest.spyOn(accessArrangementsService, 'getCurrentViewMode').mockResolvedValue(aaViewModes.readonly)
      const req = getReq(reqParams)
      const res = getRes()
      try {
        await controller.postSubmitAccessArrangements(req, res, next)
        fail('error should have been thrown to prevent edit')
      } catch (error) {
        expect(error.name).toBe('AccessArrangementsNotEditableError')
      }
    })
    test('submits pupils access arrangements', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(res, 'redirect').mockImplementation()
      jest.spyOn(accessArrangementsService, 'getCurrentViewMode').mockResolvedValue(aaViewModes.edit)
      jest.spyOn(accessArrangementsService, 'submit').mockResolvedValue({ id: 1, foreName: 'foreName', lastName: 'lastName' })
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
      jest.spyOn(businessAvailabilityService, 'determineAccessArrangementsEligibility').mockImplementation()
      await controller.postSubmitAccessArrangements(req, res, next)
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(businessAvailabilityService.determineAccessArrangementsEligibility).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalled()
      expect(accessArrangementsService.submit).toHaveBeenCalled()
    })
    test('calls next if accessArrangementsService submit throws an error', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(res, 'redirect')
      const error = new Error('error')
      jest.spyOn(accessArrangementsService, 'getCurrentViewMode').mockResolvedValue(aaViewModes.edit)
      jest.spyOn(accessArrangementsService, 'submit').mockResolvedValue(Promise.reject(error))
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
      jest.spyOn(businessAvailabilityService, 'determineAccessArrangementsEligibility').mockImplementation()
      try {
        await controller.postSubmitAccessArrangements(req, res, next)
      } catch (error) {
        expect(error.message).toBe('error')
      }
      expect(res.redirect).not.toHaveBeenCalled()
      expect(req.flash).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })
    test('calls getSelectAccessArrangements if accessArrangementsService submit throws a validation Error', async () => {
      const res = getRes()
      const req = getReq(reqParams)
      jest.spyOn(res, 'redirect').mockImplementation()
      jest.spyOn(controller, 'getSelectAccessArrangements').mockImplementation()
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
      jest.spyOn(accessArrangementsService, 'getCurrentViewMode').mockResolvedValue(aaViewModes.edit)
      jest.spyOn(businessAvailabilityService, 'determineAccessArrangementsEligibility').mockImplementation()
      jest.spyOn(accessArrangementsService, 'submit').mockResolvedValue(Promise.reject(new ValidationError()))
      try {
        await controller.postSubmitAccessArrangements(req, res, next)
      } catch (error) {
        expect(error.message).toBe('error')
      }
      expect(res.redirect).not.toHaveBeenCalled()
      expect(req.flash).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
      expect(controller.getSelectAccessArrangements).toHaveBeenCalled()
    })
    test('calls getEditAccessArrangements if accessArrangementsService submit throws a validation Error on edit view', async () => {
      const reqParamsClone = R.clone(reqParams)
      reqParamsClone.body = {
        isEditView: 'true'
      }
      const res = getRes()
      const req = getReq(reqParamsClone)
      jest.spyOn(res, 'redirect').mockImplementation()
      jest.spyOn(controller, 'getSelectAccessArrangements').mockImplementation()
      jest.spyOn(controller, 'getEditAccessArrangements').mockImplementation()
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
      jest.spyOn(accessArrangementsService, 'getCurrentViewMode').mockResolvedValue(aaViewModes.edit)
      jest.spyOn(businessAvailabilityService, 'determineAccessArrangementsEligibility').mockImplementation()
      jest.spyOn(accessArrangementsService, 'submit').mockResolvedValue(Promise.reject(new ValidationError()))
      try {
        await controller.postSubmitAccessArrangements(req, res, next)
      } catch (error) {
        expect(error.message).toBe('error')
      }
      expect(res.redirect).not.toHaveBeenCalled()
      expect(req.flash).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
      expect(controller.getSelectAccessArrangements).not.toHaveBeenCalled()
      expect(controller.getEditAccessArrangements).toHaveBeenCalled()
    })
  })

  describe('getEditAccessArrangements route', () => {
    const reqParams = (urlSlug) => {
      return {
        method: 'GET',
        url: `/access-arrangements/select-access-arrangements/${urlSlug}`,
        params: {
          pupilUrlSlug: 'pupilUrlSlug'
        }
      }
    }
    test('throws an error if edit mode not available', async () => {
      jest.spyOn(accessArrangementsService, 'getCurrentViewMode').mockResolvedValue(aaViewModes.readonly)
      const req = getReq(reqParams)
      const res = getRes()
      try {
        await controller.getEditAccessArrangements(req, res, next)
        fail('error should have been thrown to prevent edit')
      } catch (error) {
        expect(error.name).toBe('AccessArrangementsNotEditableError')
      }
    })
    test('displays the edit access arrangements page', async () => {
      const res = getRes()
      const req = getReq(reqParams('urlSlug'))
      const expectedSchoolId = 123
      req.user = {
        schoolId: expectedSchoolId
      }
      jest.spyOn(res, 'render').mockImplementation()
      jest.spyOn(accessArrangementsService, 'getAccessArrangements').mockImplementation()
      jest.spyOn(accessArrangementsService, 'getCurrentViewMode').mockResolvedValue(aaViewModes.edit)
      jest.spyOn(accessArrangementsDescriptionsPresenter, 'getPresentationData').mockImplementation()
      jest.spyOn(accessArrangementsDescriptionsPresenter, 'addReasonRequiredIndication').mockImplementation()
      jest.spyOn(pupilAccessArrangementsEditService, 'getEditData').mockImplementation()
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
      jest.spyOn(businessAvailabilityService, 'determineAccessArrangementsEligibility').mockImplementation()
      await controller.getEditAccessArrangements(req, res, next)
      expect(res.locals.pageTitle).toBe('Edit access arrangement for pupil')
      expect(res.render).toHaveBeenCalled()
      expect(accessArrangementsService.getAccessArrangements).toHaveBeenCalled()
      expect(pupilAccessArrangementsEditService.getEditData).toHaveBeenCalledWith({}, 'pupilUrlSlug', expectedSchoolId)
    })
    test('calls next when an error occurs during service call', async () => {
      const res = getRes()
      const req = getReq(reqParams('urlSlug'))
      jest.spyOn(res, 'render')
      const error = new Error('error')
      jest.spyOn(accessArrangementsService, 'getAccessArrangements').mockImplementation()
      jest.spyOn(accessArrangementsService, 'getCurrentViewMode').mockResolvedValue(aaViewModes.edit)
      jest.spyOn(accessArrangementsDescriptionsPresenter, 'getPresentationData').mockImplementation()
      jest.spyOn(accessArrangementsDescriptionsPresenter, 'addReasonRequiredIndication').mockImplementation()
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
      jest.spyOn(businessAvailabilityService, 'determineAccessArrangementsEligibility').mockImplementation()
      jest.spyOn(pupilAccessArrangementsEditService, 'getEditData').mockResolvedValue(Promise.reject(error))
      await controller.getEditAccessArrangements(req, res, next)
      expect(res.render).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
    })
  })

  describe('getDeleteAccessArrangements route', () => {
    const reqParams = (urlSlug) => {
      return {
        method: 'GET',
        url: `/access-arrangements/delete-access-arrangements/${urlSlug}`,
        params: {
          pupilUrlSlug: 'pupilUrlSlug'
        }
      }
    }
    test('redirects to error page if edit mode not available', async () => {
      jest.spyOn(accessArrangementsService, 'getCurrentViewMode').mockResolvedValue(aaViewModes.readonly)
      const req = getReq(reqParams)
      const res = getRes()
      await controller.getDeleteAccessArrangements(req, res, next)
      expect(next).toHaveBeenCalledWith(new AccessArrangementsNotEditableError())
    })
    test('redirects to overview page when successfully deleting', async () => {
      const res = getRes()
      const req = getReq(reqParams('urlSlug'))
      jest.spyOn(res, 'redirect').mockImplementation()
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
      jest.spyOn(businessAvailabilityService, 'determineAccessArrangementsEligibility').mockImplementation()
      jest.spyOn(accessArrangementsService, 'getCurrentViewMode').mockResolvedValue(aaViewModes.edit)
      jest.spyOn(pupilAccessArrangementsService, 'deletePupilAccessArrangements').mockResolvedValue({
        id: 1,
        foreName: 'foreName',
        lastName: 'lastName'
      })
      await controller.getDeleteAccessArrangements(req, res, next)
      expect(checkWindowV2Service.getActiveCheckWindow).toHaveBeenCalled()
      expect(businessAvailabilityService.determineAccessArrangementsEligibility).toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalled()
      expect(req.flash).toHaveBeenCalled()
    })
    test('calls next when an error occurs during service call', async () => {
      const res = getRes()
      const req = getReq(reqParams('urlSlug'))
      jest.spyOn(res, 'redirect').mockImplementation()
      jest.spyOn(checkWindowV2Service, 'getActiveCheckWindow').mockImplementation()
      jest.spyOn(businessAvailabilityService, 'determineAccessArrangementsEligibility').mockImplementation()
      jest.spyOn(accessArrangementsService, 'getCurrentViewMode').mockResolvedValue(aaViewModes.edit)
      const error = new Error('error')
      jest.spyOn(pupilAccessArrangementsService, 'deletePupilAccessArrangements').mockResolvedValue(Promise.reject(error))
      await controller.getDeleteAccessArrangements(req, res, next)
      expect(res.redirect).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalledWith(error)
    })
  })
})

/**
 * @param {moment.Moment} baseTime - set the fake time to this moment object
 *
 */
function setupFakeTime (baseTime) {
  if (!moment.isMoment(baseTime)) {
    throw new Error('moment.Moment time expected')
  }
  jest.useFakeTimers('modern')
  jest.setSystemTime(baseTime.toDate())
}

function tearDownFakeTime () {
  const realTime = jest.getRealSystemTime()
  jest.setSystemTime(realTime)
}
