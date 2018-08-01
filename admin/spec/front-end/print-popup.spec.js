'use strict'
/* global window screen describe it expect spyOn beforeEach */

describe('printPopup', function () {
  describe('openWindow', function () {
    let width
    let height
    let left
    beforeEach(() => {
      width = screen.width / 2
      height = screen.height / 2
      left = (screen.width / 2) - (width / 2)
    })
    it('should open popup without parameters when not supplied', function () {
      spyOn(window, 'open')
      window.GOVUK.printPopup.openWindow('pinEnv')
      expect(window.open).toHaveBeenCalledWith(
        '/pupil-pin/print-pinEnv-pins?',
        'Print preview',
        'left=' + left + ', top=100, width=' + width + ', height=' + height + ', toolbar=0, resizable=0'
      )
    })
    it('should open popup with parameters when supplied', function () {
      spyOn(window, 'open')
      window.GOVUK.printPopup.openWindow('pinEnv', 'params')
      expect(window.open).toHaveBeenCalledWith(
        '/pupil-pin/print-pinEnv-pins?params',
        'Print preview',
        'left=' + left + ', top=100, width=' + width + ', height=' + height + ', toolbar=0, resizable=0'
      )
    })
  })

  describe('parseParams', function () {
    it('should parse a serialized array properly', function () {
      const result = window.GOVUK.printPopup.parseParams([
        { name: 'param1', value: 'a' },
        { name: 'param2', value: 'b' }
      ])
      expect(result).toBe('param1=a&param2=b&')
    })
  })
})
