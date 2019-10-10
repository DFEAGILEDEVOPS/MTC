/* global describe, expect, it */

const serviceMessagePresenter = require('../../../helpers/service-message-presenter')

describe('serviceMessagePresenter', () => {
  describe('getFlashMessage', () => {
    it('returns the edited flash message is isEdit is found as true on the request data', () => {
      const requestData = { isEditView: true }
      const result = serviceMessagePresenter.getFlashMessage(requestData)
      expect(result).toBe('Service message has been updated')
    })
    it('returns the created flash message is isEdit is found as false on the request data', () => {
      const requestData = { isEditView: false }
      const result = serviceMessagePresenter.getFlashMessage(requestData)
      expect(result).toBe('Service message has been created')
    })
  })
})
