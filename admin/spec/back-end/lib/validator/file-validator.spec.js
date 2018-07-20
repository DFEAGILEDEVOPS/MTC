'use strict'

/* global beforeEach, afterEach, describe, it, expect */

const fs = require('fs-extra')
const sinon = require('sinon')
const fileValidator = require('../../../../lib/validator/file-validator')

describe('File validator', function () {
  let uploadedFile
  let sandbox

  beforeEach(function (done) {
    sandbox = sinon.sandbox.create()
    done()
  })
  afterEach(() => {
    sandbox.restore()
  })

  describe('received valid data and', function () {
    beforeEach(function (done) {
      const fsMock = sandbox.mock(fs)
      fsMock.expects('readFileSync').resolves('text')
      uploadedFile = {
        filename: 'test.csv'
      }
      done()
    })

    it('allows a valid request', async function (done) {
      const validationError = await fileValidator.validate(uploadedFile, 'template-upload')
      expect(validationError.hasError()).toBe(false)
      done()
    })
  })
  describe('received empty data and', function () {
    beforeEach(function (done) {
      const fsMock = sandbox.mock(fs)
      fsMock.expects('readFileSync').resolves('')
      uploadedFile = null
      done()
    })
    it('detects no file', async function (done) {
      const validationError = await fileValidator.validate(uploadedFile, 'template-upload')
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('template-upload')).toBe(true)
      expect(validationError.get('template-upload')).toBe('Please select a .csv file to save')
      done()
    })
    it('detects empty file', async function (done) {
      uploadedFile = 'test'
      const validationError = await fileValidator.validate(uploadedFile, 'template-upload')
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('template-upload')).toBe(true)
      expect(validationError.get('template-upload')).toBe('File rejected. File can\'t be read')
      done()
    })
  })
})
