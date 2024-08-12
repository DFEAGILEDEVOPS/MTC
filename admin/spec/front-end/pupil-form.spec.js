'use strict'

/* global $ describe it expect beforeEach afterEach spyOn jasmine */
/* eslint-disable no-var */

function initPupilFormElements () {
  const $dobFieldSet = `<fieldset aria-labelledby="date-of-birth">
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
      <div id='js-age-warning' class="hide-age-content">
          <div class="panel panel-border-wide">
              <div class="">
                  <div class="form-label"><div>The expected age range of pupils taking the check is 8 to 9 years old.</div>
                  </div>
              </div>
          </div>
      </div>
  </fieldset>
  `
  $(document.body).append($dobFieldSet)
}

describe('pupil-form', function () {
  describe('displayAgeTextArea', function () {
  /**
   * The expected age as of 1 September (start of academic year) should be greater than or equal to 8 years and less than 9 years old
   *
   * If an age as of 1 September is entered that is between 7 years and 0 days AND 7 years 364 days or between 9 years and 0 days AND
   * 9 years and 364 days, then a warning message should be raised (see the current system for this message).
   *
   * If the age as of 1 September is outside the above e.g. younger than 7 years or older than 10 years then the
   * pupil must not be added to the system.
   **/
    beforeEach(function () {
      $('body').empty()
      initPupilFormElements()
      window.MTCAdmin.pupilForm()
      spyOn(window.MTCAdmin, 'determineAcademicYear').and.returnValue(2023)
      jasmine.clock().install()
      jasmine.clock().mockDate(new Date(2024, 7, 1)) // Make all the tests work from 2024 test cycle: 1-AUG-24
    })

    afterEach(() => {
      jasmine.clock().uninstall()
    })

    it('should display the age warning if a pupil is 7 years 0 days old on 1 Sep', function () {
      $('#dob-day').val('1')
      $('#dob-day').trigger('input')
      $('#dob-month').val('9') // 1-Sep-2016
      $('#dob-month').trigger('input')
      $('#dob-year').val('2017')
      $('#dob-year').trigger('input')
      expect($('.show-age-content').length).toBeGreaterThan(0)
      expect($('.hide-age-content').length).toEqual(0)
    })

    it('should display the age warning if a pupil is 7 years 364 days old on 1 Sep (too young by a day)', function () {
      $('#dob-day').val('2')
      $('#dob-day').trigger('input')
      $('#dob-month').val('9') // 2-Sep-2016
      $('#dob-month').trigger('input')
      $('#dob-year').val('2016')
      $('#dob-year').trigger('input')
      expect($('.show-age-content').length).toBeGreaterThan(0)
      expect($('.hide-age-content').length).toEqual(0)
    })

    it('should not display the age warning if a pupil is 8 years and 0 days on 1 Sep', function () {
      $('#dob-day').val('01')
      $('#dob-day').trigger('input')
      $('#dob-month').val('09')
      $('#dob-month').trigger('input')
      $('#dob-year').val('2016')
      $('#dob-year').trigger('input')
      expect($('.show-age-content').length).toEqual(0)
      expect($('.hide-age-content').length).toBeGreaterThan(0)
    })

    it('should not display the age warning if a pupil is 8 years and 364 days on 1 Sep', function () {
      $('#dob-day').val('03')
      $('#dob-day').trigger('input')
      $('#dob-month').val('09')
      $('#dob-month').trigger('input')
      $('#dob-year').val('2015')
      $('#dob-year').trigger('input')
      expect($('.show-age-content').length).toEqual(0)
      expect($('.hide-age-content').length).toBeGreaterThan(0)
    })

    it('should display the age warning if a pupil is 9 years old and 0 days on 1 Sep', function () {
      $('#dob-day').val('01')
      $('#dob-day').trigger('input')
      $('#dob-month').val('09')
      $('#dob-month').trigger('input')
      $('#dob-year').val('2015')
      $('#dob-year').trigger('input')
      expect($('.show-age-content').length).toBeGreaterThan(0)
      expect($('.hide-age-content').length).toEqual(0)
    })
  })
  describe('determineAcademicYear', function () {
    beforeEach(function () {
      jasmine.clock().install()
    })
    afterEach(function () {
      jasmine.clock().uninstall()
    })
    it('should return previous year if the current date is between the beginning of this year and the last day of august', function () {
      const currentYear = (new Date()).getFullYear()
      const baseTime = new Date(currentYear, 7, 31)
      jasmine.clock().mockDate(baseTime)
      const academicYear = window.MTCAdmin.determineAcademicYear()
      expect(academicYear).toBe(currentYear - 1)
    })
    it('should return current year if the current date is between the beginning of August and the last day of the year', function () {
      const currentYear = (new Date()).getFullYear()
      const baseTime = new Date(currentYear, 11, 31)
      jasmine.clock().mockDate(baseTime)
      const academicYear = window.MTCAdmin.determineAcademicYear()
      expect(academicYear).toBe(currentYear)
    })
  })
})
