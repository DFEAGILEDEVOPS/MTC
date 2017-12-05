'use strict'
/* global describe, beforeEach, afterEach, it, expect */

const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
require('sinon-mongoose')

const CheckForm = require('../../../models/check-form')
const checkFormMock = require('../../mocks/check-form')
const checkFormsMock = require('../../mocks/check-forms')

describe('checkWindowDataService', () => {
  let service, sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => sandbox.restore())

  describe('#getActiveForm', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(CheckForm).expects('findOne').chain('exec').resolves(checkFormMock)
      service = proxyquire('../../../services/data-access/check-form.data.service', {
        '../../models/check-form': CheckForm
      })
    })

    it('should fetch a check form document', async () => {
      const results = await service.getActiveForm()
      expect(mock.verify()).toBe(true)
      expect(results.isDeleted).toBe(false)
    })
  })

  describe('#getActiveFormPlain', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(CheckForm).expects('findOne').chain('lean').chain('exec').resolves(checkFormMock)
      service = proxyquire('../../../services/data-access/check-form.data.service', {
        '../../models/check-form': CheckForm
      })
    })

    it('should fetch a check form document', async () => {
      const results = await service.getActiveFormPlain()
      expect(mock.verify()).toBe(true)
      expect(results.isDeleted).toBe(false)
    })
  })

  describe('#fetchSortedActiveForms', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(CheckForm).expects('find').chain('sort').chain('exec').resolves(checkFormsMock)
      service = proxyquire('../../../services/data-access/check-form.data.service', {
        '../../models/check-form': CheckForm
      })
    })

    it('should fetch check form documents', async () => {
      await service.fetchSortedActiveForms({}, 'name', 'asc')
      expect(mock.verify()).toBe(true)
    })
  })

  describe('#create', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(CheckForm.prototype).expects('save').resolves(checkFormsMock)
      service = proxyquire('../../../services/data-access/check-form.data.service', {
        '../../models/check-form': CheckForm
      })
    })

    it('validates the mock', async () => {
      await service.create({ test: 'property' })
      expect(mock.verify()).toBe(true)
    })
  })

  describe('#findCheckFormByName', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(CheckForm).expects('findOne').chain('lean').chain('exec').resolves(checkFormMock)
      service = proxyquire('../../../services/data-access/check-form.data.service', {
        '../../models/check-form': CheckForm
      })
    })

    it('looks for a document by check form name', async () => {
      await service.findCheckFormByName('MTC0100')
      expect(mock.verify()).toBe(true)
    })
  })
})
