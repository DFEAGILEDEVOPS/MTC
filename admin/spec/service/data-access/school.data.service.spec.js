'use strict'
/* global describe, beforeEach, afterEach, it, expect */

const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
require('sinon-mongoose')

const School = require('../../../models/school')
const schoolMock = require('../../mocks/school')

describe('school.data.service', () => {
  let service, sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => sandbox.restore())

  describe('#findOne', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(School).expects('findOne').chain('exec').resolves(schoolMock)
      service = proxyquire('../../../services/data-access/school.data.service', {
        '../../models/school': School
      })
    })

    it('calls the model', () => {
      service.findOne({ _id: 'some-id' })
      expect(mock.verify()).toBe(true)
    })
  })

  describe('#save', () => {
    let school
    let mock
    beforeEach(() => {
      school = Object.assign({}, schoolMock)
      school.save = () => {}
      mock = sandbox.mock(school).expects('save').resolves(schoolMock)
      service = require('../../../services/data-access/school.data.service')
    })

    it('calls the model', () => {
      service.save(school)
      expect(mock.verify()).toBe(true)
    })
  })

  describe('#find', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(School).expects('find').chain('lean').chain('exec').resolves(schoolMock)
      service = proxyquire('../../../services/data-access/school.data.service', {
        '../../models/school': School
      })
    })

    it('calls the model', () => {
      service.find({ _id: 'some-id' })
      expect(mock.verify()).toBe(true)
    })
  })
})
