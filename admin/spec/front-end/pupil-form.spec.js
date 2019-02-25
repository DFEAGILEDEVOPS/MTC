'use strict'

/* global $ describe it expect beforeEach */

function initPupilFormElements() {
  const $dobFieldSet =  `<fieldset aria-labelledby="date-of-birth">
      <div class="form-date">
          <div class="form-group form-group-day">
              <label class="form-label" for="dob-day">Day</label>
              <input class="form-control " id="dob-day" name="dob-day" type="number" min="0" max="31" value="">
          </div>
          <div class="form-group form-group-month">
              <label class="form-label" for="dob-month">Month</label>
              <input class="form-control " id="dob-month" name="dob-month" type="number" min="0" max="12" value="">
          </div>
          <div class="form-group form-group-year">
              <label class="form-label" for="dob-year">Year</label>
              <input class="form-control " id="dob-year" name="dob-year" type="number" min="0" max="2019" value="">
          </div>
      </div>
      <div class="hide-age-content">
          <div class="panel panel-border-wide">
              <div class="">
                  <div class="form-label" for="ageReason"><div>The expected age range of pupils taking the check is 8 to 9 years old. Please provide a reason why this pupil's age is outside of this range.</div>
  
                      <textarea id="ageReason" name="ageReason" class="form-control form-control-3-4 age-reason-textarea " rows="3" maxlength="1000"></textarea>
                  </div>
              </div>
          </div>
      </div>
  </fieldset>
  `
  $(document.body).append($dobFieldSet)
}

describe('pupil-form', function () {
  describe('after page load', function () {
    beforeEach(function () {
      $('body').empty()
      initPupilFormElements()
      window.GOVUK.pupilForm()
    })
    it('should display the age content if the pupils input dob is within the academic year of aged 7', function () {
      var pupilAgeSevenYear = ((new Date()).getFullYear() - 7).toString()
      $('#dob-day').val('01')
      $('#dob-day').trigger('input')
      $('#dob-month').val('09')
      $('#dob-month').trigger('input')
      $('#dob-year').val(pupilAgeSevenYear)
      $('#dob-year').trigger('input')
      expect($('.show-age-content').length).toBeGreaterThan(0)
      expect($('.hide-age-content').length).toEqual(0)
    })
    it('should not display the age content if the pupils input dob is not within the academic year of aged 7', function () {
      var pupilAgeSevenYear = ((new Date()).getFullYear() - 7).toString()
      $('#dob-day').val('31')
      $('#dob-day').trigger('input')
      $('#dob-month').val('08')
      $('#dob-month').trigger('input')
      $('#dob-year').val(pupilAgeSevenYear)
      $('#dob-year').trigger('input')
      expect($('.show-age-content').length).toEqual(0)
      expect($('.hide-age-content').length).toBeGreaterThan(0)
    })
    it('should display the age content if the pupils input dob is within the academic year of aged 10', function () {
      var pupilAgeTenYear = ((new Date()).getFullYear() - 10).toString()
      $('#dob-day').val('01')
      $('#dob-day').trigger('input')
      $('#dob-month').val('09')
      $('#dob-month').trigger('input')
      $('#dob-year').val(pupilAgeTenYear)
      $('#dob-year').trigger('input')
      expect($('.show-age-content').length).toBeGreaterThan(0)
      expect($('.hide-age-content').length).toEqual(0)
    })
    it('should not display the age content if the pupils input dob is not within the academic year of aged 10', function () {
      var pupilAgeSevenYear = ((new Date()).getFullYear() - 10).toString()
      $('#dob-day').val('31')
      $('#dob-day').trigger('input')
      $('#dob-month').val('08')
      $('#dob-month').trigger('input')
      $('#dob-year').val(pupilAgeSevenYear)
      $('#dob-year').trigger('input')
      expect($('.show-age-content').length).toEqual(0)
      expect($('.hide-age-content').length).toBeGreaterThan(0)
    })
    it('should clear the textarea value when hiding', function () {
      var pupilAgeSevenYear = ((new Date()).getFullYear() - 10).toString()
      $('.hide-age-content').addClass('show-age-content')
      $('.show-age-content').removeClass('hide-age-content')
      $('#ageReason').val('reason')
      $('#dob-day').val('31')
      $('#dob-day').trigger('input')
      $('#dob-month').val('08')
      $('#dob-month').trigger('input')
      $('#dob-year').val(pupilAgeSevenYear)
      $('#dob-year').trigger('input')
      expect($('#ageReason').val()).toEqual('')
      expect($('.show-age-content').length).toEqual(0)
      expect($('.hide-age-content').length).toBeGreaterThan(0)
    })
  })
})
