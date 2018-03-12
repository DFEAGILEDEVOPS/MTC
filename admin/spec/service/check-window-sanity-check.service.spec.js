/* global describe, it, expect, spyOn */

const checkWindowDataService = require('../../services/data-access/check-window.data.service')
const checkFormService = require('../../services/check-form.service')
const checkWindowSanityCheckService = require('../../services/check-window-sanity-check.service')
const serviceManagerErrorMessages = require('../../lib/errors/service-manager')
const testDeveloperErrorMessages = require('../../lib/errors/test-developer')

const checkWindowMock = require('../mocks/check-window')
const checkFormMock = require('../mocks/check-form')

describe('check-window-sanity-check.service', () => {
  it('returns an error if there is no active checkwindow', async () => {
    spyOn(checkWindowDataService, 'sqlFindOneCurrent')
    spyOn(checkFormService, 'getAllFormsForCheckWindow')
    const error = await checkWindowSanityCheckService.check()
    expect(error).toBe(serviceManagerErrorMessages.noCurrentCheckWindow)
  })
  it('returns an error if there are no check forms assigned', async () => {
    spyOn(checkWindowDataService, 'sqlFindOneCurrent').and.returnValue(checkWindowMock)
    spyOn(checkFormService, 'getAllFormsForCheckWindow')
    const error = await checkWindowSanityCheckService.check()
    expect(error).toBe(testDeveloperErrorMessages.noCheckFormsAssigned)
  })
  it('returns undefined if there is an active check window and check forms assigned', async () => {
    spyOn(checkWindowDataService, 'sqlFindOneCurrent').and.returnValue(checkWindowMock)
    spyOn(checkFormService, 'getAllFormsForCheckWindow').and.returnValue([checkFormMock])
    const error = await checkWindowSanityCheckService.check()
    expect(error).toBeUndefined()
  })
})
