'use strict'
/* global describe, beforeEach, afterEach, it, expect */

const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
const checkUniqueUPN = require('../../../services/data-access/check-unique-upn.data.service')
require('sinon-mongoose')

const Pupil = require('../../../models/pupil')
const pupilMock = require('../../mocks/pupil')

describe('check-unique-upn.data.service.spec', () => {

  let sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => sandbox.restore())

  describe('isUnique', () => {
    beforeEach(() => {
      sandbox.mock(Pupil).expects('findOne').chain('exec').resolves(pupilMock)
      proxyquire('../../../services/data-access/completed-check.data.service', {
        '../../models/pupil': Pupil
      })
    })

    it('returns true if UPN is already allocated', async () => {
      const upn = 'X822200014001'
      const id = '595cd5416e5ca13e48ed2518'
      const isUnique = await checkUniqueUPN.isUnique(upn, id)
      expect(isUnique).toBe(false)
    })

    it('returns false if UPN is not allocated', async () => {
      const upn = 'X822200014002'
      const id = '595cd5416e5ca13e48ed2519'
      const isUnique = await checkUniqueUPN.isUnique(upn, id)
      expect(isUnique).toBe(true)
    })
  })
})
