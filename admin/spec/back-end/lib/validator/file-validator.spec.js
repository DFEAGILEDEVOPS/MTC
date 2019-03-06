'use strict'

/* global beforeEach, afterEach, describe, it, expect */

const fs = require('fs-extra')
const sinon = require('sinon')
const fileValidator = require('../../../../lib/validator/file-validator')
const fileCsvErrors = require('../../../../lib/errors/file-csv')

describe('File validator', function () {
  let uploadedFile
  let sandbox

  beforeEach(function (done) {
    sandbox = sinon.createSandbox()
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
        file: 'test.csv'
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
      expect(validationError.get('template-upload')).toBe(fileCsvErrors.noFile)
      done()
    })
    it('detects empty file on unreadable file', async function (done) {
      uploadedFile = { file: 'test.csv' }
      const validationError = await fileValidator.validate(uploadedFile, 'template-upload')
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('template-upload')).toBe(true)
      expect(validationError.get('template-upload')).toBe(fileCsvErrors.isNotReadable)
      done()
    })
    it('detects not acceptable file', async function (done) {
      uploadedFile = { file: 'file.txt' }
      const validationError = await fileValidator.validate(uploadedFile, 'template-upload')
      expect(validationError.hasError()).toBe(true)
      expect(validationError.isError('template-upload')).toBe(true)
      expect(validationError.get('template-upload')).toBe(fileCsvErrors.noCSVFile)
      done()
    })
  })
})
