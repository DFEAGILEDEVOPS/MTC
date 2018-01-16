'use strict'
/* global describe beforeEach it expect spyOn fail */

// Test the check-form.service populateFromFile method

const config = require('../../config')
const path = require('path')
const checkFormService = require('../../services/check-form.service')

describe('check form service.populateFromFile', () => {
  let checkForm, service

  describe('with spy', function () {
    beforeEach(function () {
      checkForm = {}
      spyOn(checkFormService, 'isRowCountValid')
      service = require('../../services/check-form.service')
    })

    it('should throw an error if not called with a checkForm in arg 1', async (done) => {
      try {
        await service.populateFromFile(null, null)
        expect('expected to throw').toBe('error')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBe('Check form argument missing')
      }
      done()
    })

    it('should throw an error if not called with a csvFile in arg 2', async (done) => {
      try {
        await service.populateFromFile(checkForm, null)
        expect('expected to throw').toBe('error')
      } catch (error) {
        expect(error).toBeDefined()
        expect(error.message).toBe('CSV file argument missing')
      }
      done()
    })
  })

  it('should return a populated object', async (done) => {
    // good csv file example
    const csvFile = 'data/fixtures/check-form-1.csv'
    const file = path.join(__dirname, '/../../', csvFile)
    try {
      checkForm = await service.populateFromFile(checkForm, file)
      const questions = JSON.parse(checkForm.formData)
      expect(questions.length).toBe(config.LINES_PER_CHECK_FORM)
      // check last question is 12 x 12
      expect(questions[9].f1).toBe(12)
      expect(questions[9].f2).toBe(12)
    } catch (error) {
      fail('should not throw an error. Error:' + error.message)
    }
    done()
  })

  it('should throw when the csv data contains out-of-range numbers', async (done) => {
    const csvFile = 'data/fixtures/check-form-2.csv'
    try {
      const file = path.join(__dirname, '/../../', csvFile)
      await service.populateFromFile(checkForm, file)
      expect('expected to throw').toBe('error')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBe('Row is invalid: [1] [-1]')
    }
    done()
  })

  it('should throw when the csv data contains non-numeric data', async (done) => {
    const csvFile = 'data/fixtures/check-form-3.csv'
    try {
      await service.populateFromFile(checkForm, path.join(__dirname, '/../../', csvFile))
      expect('expected to throw').toBe('error')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBe('Row is invalid: [a] [b]')
    }
    done()
  })

  it('should throw when the csv data contains a header row', async (done) => {
    let csvFile = 'data/fixtures/check-form-4.csv'
    try {
      await service.populateFromFile(checkForm, path.join(__dirname, '/../../', csvFile))
      expect('expected to throw').toBe('error')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBe('Row is invalid: [Factor 1] [Factor 2]')
    }
    done()
  })

  it('should trim values automatically', async (done) => {
    let csvFile = 'data/fixtures/check-form-5.csv'
    try {
      checkForm = await service.populateFromFile(checkForm, path.join(__dirname, '/../../', csvFile))
      const questions = JSON.parse(checkForm.formData)
      // Test trim on Q4
      expect(questions[4 - 1].f1).toBe(1)

      // Test rtrim() on Q2
      expect(questions[2 - 1].f1).toBe(1)

      // Test ltrim() on Q2
      expect(questions[2 - 1].f2).toBe(2)

      // Test trim on quoted strings
      expect(questions[10 - 1].f1).toBe(12)
      expect(questions[10 - 1].f2).toBe(12)
    } catch (error) {
      expect('not expected to throw').toBe('error')
    }
    done()
  })

  it('should detect if the wrong number of columns are provided', async (done) => {
    let csvFile = 'data/fixtures/check-form-6.csv'
    try {
      await service.populateFromFile(checkForm, path.join(__dirname, '/../../', csvFile))
      expect('expected to throw').toBe('error')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBe('Row is invalid: [1] [1]')
    }
    done()
  })
})
