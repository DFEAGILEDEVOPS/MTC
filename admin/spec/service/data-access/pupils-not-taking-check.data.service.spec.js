'use strict'
/* global describe, beforeEach, afterEach, it, expect */

const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
require('sinon-mongoose')

const Pupil = require('../../../models/pupil')
const pupilsWithReasonsMock = require('../../mocks/pupils-with-reason')

describe('pupils-not-taking-check.data.service', () => {
  let service, service2, sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => sandbox.restore())

  describe('#fetchPupilsWithReasons', () => {
    let mock

    beforeEach(() => {
      mock = sinon.mock(Pupil).expects('find').chain('sort').resolves(pupilsWithReasonsMock)
      service = proxyquire('../../../services/data-access/pupils-not-taking-check.data.service', {
        '../../models/pupil': Pupil
      })
    })

    it('should return a list of pupils with reasons', () => {
      service.fetchPupilsWithReasons(9991001)
      console.log('FOO', mock.verify())
      expect(mock.verify()).toBe(true)
    })
  })
})
