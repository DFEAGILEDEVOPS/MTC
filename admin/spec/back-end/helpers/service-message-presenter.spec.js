
const serviceMessagePresenter = require('../../../helpers/service-message-presenter')

describe('serviceMessagePresenter', () => {
  describe('getFlashMessage', () => {
    test('returns the created flash message on the request data', () => {
      const result = serviceMessagePresenter.getFlashMessage()
      expect(result).toBe('Service message has successfully been created')
    })
  })
})
