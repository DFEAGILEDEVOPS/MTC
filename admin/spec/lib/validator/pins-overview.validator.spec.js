'use strict'
/* global describe, it, expect */
const pinsOverviewValidator = require('../../../lib/validator/pins-overview-validator')
const pinsOverviewErrorMessages = require('../../../lib/errors/pins-overview')
const checkWindowMock = require('../../mocks/check-window')
const checkFormMock = require('../../mocks/check-form')

describe('pins-overview-validator', () => {
  it('returns an error if there is no active checkwindow', () => {
    const checkWindow = null
    const allForms = [checkFormMock]
    const error = pinsOverviewValidator.validate(checkWindow, allForms)
    expect(error).toBe(pinsOverviewErrorMessages.noCurrentCheckWindow)
  })
  it('returns an error if there are no check forms assigned', () => {
    const checkWindow = checkWindowMock
    const allForms = []
    const error = pinsOverviewValidator.validate(checkWindow, allForms)
    expect(error).toBe(pinsOverviewErrorMessages.noCheckFormsAssigned)
  })
  it('returns noCheckWindowAndForms error if there are no check forms assigned and there is no active checkwindow', () => {
    const checkWindow = null
    const allForms = []
    const error = pinsOverviewValidator.validate(checkWindow, allForms)
    expect(error).toBe(pinsOverviewErrorMessages.noCheckWindowAndForms)
  })
  it('returns an empty error object if there is an active check window and and check forms assigned', () => {
    const checkWindow = checkWindowMock
    const allForms = [checkFormMock]
    const error = pinsOverviewValidator.validate(checkWindow, allForms)
    expect(error).toBeUndefined()
  })
})
