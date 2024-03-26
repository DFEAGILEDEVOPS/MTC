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
      <div class="hide-age-content">
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
    beforeEach(function () {
      $('body').empty()
      initPupilFormElements()
      window.MTCAdmin.pupilForm()
      spyOn(window.MTCAdmin, 'determineAcademicYear').and.returnValue((new Date()).getFullYear())
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
      $('#dob-day').val('02')
      $('#dob-day').trigger('input')
      $('#dob-month').val('09')
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
      $('#dob-day').val('02')
      $('#dob-day').trigger('input')
      $('#dob-month').val('09')
      $('#dob-month').trigger('input')
      $('#dob-year').val(pupilAgeSevenYear)
      $('#dob-year').trigger('input')
      expect($('.show-age-content').length).toEqual(0)
      expect($('.hide-age-content').length).toBeGreaterThan(0)
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
  describe('isWithinAcademicYear', function () {
    it('should return true if the input date is within second day of September on the target year until the first day of September of the next year from the target year', function () {
      const currentYear = (new Date()).getFullYear()
      const inputDate = new Date(currentYear - 11, 11, 31)
      const isWithinAcademicYear = window.MTCAdmin.isWithinAcademicYear(inputDate, currentYear, 11)
      expect(isWithinAcademicYear).toBeTruthy()
    })
    it('should return false if the input date is not within second day of September on the target year until the first day of September of the next year from the target year', function () {
      const currentYear = (new Date()).getFullYear()
      const inputDate = new Date(currentYear - 11, 1, 1)
      const isWithinAcademicYear = window.MTCAdmin.isWithinAcademicYear(inputDate, currentYear, 11)
      expect(isWithinAcademicYear).toBeFalsy()
    })
  })
})
