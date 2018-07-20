'use strict'

/* global beforeEach, describe, it, expect */

const hdfValidator = require('../../../../lib/validator/hdf-validator')
const expressValidator = require('express-validator')()

describe('HDF validator', function () {
  let req = null

  function getBody () {
    return {
      declaration: 'confirm',
      jobTitle: 'Head Teacher',
      fullName: 'John Smith'
    }
  }

  beforeEach(function (done) {
    req = {
      query: {},
      body: {},
      params: {},
      param: (name) => {
        this.params[name] = name
      }
    }

    return expressValidator(req, {}, function () {
      done()
    })
  })

  it('allows a valid request', async function (done) {
    req.body = getBody()
    let validationError = await hdfValidator.validate(req)
    expect(validationError.hasError()).toBe(false)
    done()
  })

  it('requires a job title', async function (done) {
    req.body = getBody()
    req.body.jobTitle = ''
    let validationError = await hdfValidator.validate(req)
    expect(validationError.hasError()).toBe(true)
    expect(validationError.isError('jobTitle')).toBe(true)
    done()
  })

  it('allows latin chars, hyphen and apostrophe in the job title', async function (done) {
    req.body = getBody()
    req.body.jobTitle = 'Rén-\'e'
    let validationError = await hdfValidator.validate(req)
    expect(validationError.hasError()).toBe(false)
    done()
  })

  it('Job title can be up to 35 chars long', async function (done) {
    req.body = getBody()
    req.body.jobTitle = 's'.repeat(36)
    let validationError = await hdfValidator.validate(req)
    expect(validationError.hasError()).toBe(true)
    expect(validationError.isError('jobTitle')).toBe(true)
    done()
  })

  it('signature can include numbers', async function (done) {
    req.body = getBody()
    req.body.fullName = 'Smithy99'
    let validationError = await hdfValidator.validate(req)
    expect(validationError.hasError()).toBe(false)
    expect(validationError.isError('fullName')).toBe(false)
    done()
  })
})
