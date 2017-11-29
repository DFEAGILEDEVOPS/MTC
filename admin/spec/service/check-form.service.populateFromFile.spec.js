'use strict'

/* global beforeEach, describe, it, expect */

// Test the check-form.service populateFromFile method

const path = require('path')
const proxyquire = require('proxyquire').noCallThru()
const MongooseModelMock = require('../mocks/mongoose-model-mock')

describe('check form service', () => {
  let checkForm, service

  function setupService (cb) {
    return proxyquire('../../services/check-form.service', {
      '../models/check-form': new MongooseModelMock(cb)
    })
  }

  beforeEach(function () {
    checkForm = {}
    service = setupService(function () {})
  })

  it('should have a populateFromFile() method', () => {
    expect(service.hasOwnProperty('populateFromFile')).toBe(true)
  })

  it('should throw an error if not called with a checkForm in arg 1', async (done) => {
    try {
      await service.populateFromFile(null, null)
      expect('expected to throw').toBe('error')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBe('Check form arguments missing')
    }
    done()
  })

  it('should throw an error if not called with a csvFile in arg 2', async (done) => {
    try {
      await service.populateFromFile(checkForm, null)
      expect('expected to throw').toBe('error')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toBe('CSV file arguments missing')
    }
    done()
  })

  it('should return a populated object', async (done) => {
    // good csv file example
    const csvFile = 'data/fixtures/check-form-1.csv'
    const file = path.join(__dirname, '/../../', csvFile)
    try {
      checkForm = await service.populateFromFile(checkForm, file)
      expect(checkForm.questions.length).toBe(10)
      // check last question is 12 x 12
      expect(checkForm.questions[9].f1).toBe(12)
      expect(checkForm.questions[9].f2).toBe(12)
    } catch (error) {
      console.error('should return a populated object: ', error)
      expect('not expected to throw').toBe('error')
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
      // Test trim on Q4
      expect(checkForm.questions[4 - 1].f1).toBe(1)

      // Test rtrim() on Q2
      expect(checkForm.questions[2 - 1].f1).toBe(1)

      // Test ltrim() on Q2
      expect(checkForm.questions[2 - 1].f2).toBe(2)

      // Test trim on quoted strings
      expect(checkForm.questions[10 - 1].f1).toBe(12)
      expect(checkForm.questions[10 - 1].f2).toBe(12)
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
