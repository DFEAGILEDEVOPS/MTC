'use strict'
/* global $ describe it expect beforeEach afterEach */

describe('printPopup', function () {
  describe('hideUncheckedPupils', function () {
    let fixture
    beforeEach(() => {
      fixture = $(`<div>
        <table class="container">
          <tr class="pupil-1">Pupil 1</tr>
          <tr class="pupil-2">Pupil 2</tr>
        </table>
        <div class="multiple-choice-mtc">
          <input type="checkbox" value="1" checked></input>
          <input type="checkbox" value="2"></input>
        </div>
      </div>`)
      $('body').append(fixture)
    })
    afterEach(() => {
      fixture.remove()
    })
    it('should remove the hidden class from checked pupils', function () {
      window.GOVUK.printPopup.hideUncheckedPupils('.container')
      expect($('.pupil-1').hasClass('hidden')).toBe(false)
    })
    it('should add the hidden class from unchecked pupils', function () {
      window.GOVUK.printPopup.hideUncheckedPupils('.container')
      expect($('.pupil-2').hasClass('hidden')).toBe(true)
    })
  })
})
