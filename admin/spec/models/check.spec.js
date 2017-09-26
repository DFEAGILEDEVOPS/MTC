'use strict'
/* global describe beforeEach it expect */

const { Types } = require('mongoose')
const Check = require('../../models/check')
const uuidv4 = require('uuid/v4')

describe('check model', () => {
  let check

  beforeEach(() => {
    check = new Check({
      _id: Types.ObjectId(),
      checkCode: uuidv4(),
      pupilId: Types.ObjectId(),
      checkWindowId: Types.ObjectId(),
      checkFormId: Types.ObjectId(),
      checkStartDate: new Date()
    })
  })

  it('validates a model correctly', (done) => {
    check.validate((error) => {
      expect(error).toBeNull()
      done()
    })
  })

  it('requires a checkCode in UUID v4 format', (done) => {
    check.checkCode = undefined
    check.validate((error) => {
      expect(error).toBeDefined()
      expect(error.errors.checkCode).toBeDefined()
      done()
    })

    check.checkCode = 'wrong format'
    check.validate((error) => {
      expect(error).toBeDefined()
      expect(error.errors.checkCode).toBeDefined()
      done()
    })

    check.checkCode = true
    check.validate((error) => {
      expect(error).toBeDefined()
      expect(error.errors.checkCode).toBeDefined()
      done()
    })

    check.checkCode = 666
    check.validate((error) => {
      expect(error).toBeDefined()
      expect(error.errors.checkCode).toBeDefined()
      done()
    })
  })

  it('requires a pupilId', (done) => {
    check.pupilId = undefined
    check.validate((error) => {
      expect(error).toBeDefined()
      expect(error.errors.pupilId).toBeDefined()
      done()
    })
  })

  it('requires a checkWindowId', (done) => {
    check.checkWindowId = undefined
    check.validate((error) => {
      expect(error).toBeDefined()
      expect(error.errors.checkWindowId).toBeDefined()
      done()
    })
  })

  it('requires a checkFormId', (done) => {
    check.checkFormId = undefined
    check.validate((error) => {
      expect(error).toBeDefined()
      expect(error.errors.checkFormId).toBeDefined()
      done()
    })
  })

  it('requires a checkStartDate', (done) => {
    check.checkStartDate = undefined
    check.validate((error) => {
      expect(error).toBeDefined()
      expect(error.errors.checkStartDate).toBeDefined()
      done()
    })
  })
})
