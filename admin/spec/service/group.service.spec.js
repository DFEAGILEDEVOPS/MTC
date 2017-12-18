'use strict'

/* global describe beforeEach afterEach it expect jasmine */

const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')

const Group = require('../../models/group')
const groupsMock = require('../mocks/groups')

describe('group.service', () => {
  let service
  let sandbox

  beforeEach(() => { sandbox = sinon.sandbox.create() })
  afterEach(() => { sandbox.restore() })

  function setupService (cb) {
    return proxyquire('../../services/group.service', {
      '../services/data-access/group.data.service': {
        fetchGroups: jasmine.createSpy().and.callFake(cb)
      },
      '../models/group': Group
    })
  }

  describe('#getGroups', () => {
    beforeEach(() => {
      service = setupService(function () { return Promise.resolve(groupsMock) })
    })

    it('should return groups', async (done) => {
      const groups = await service.getGroups()
      expect(groups).toEqual(groupsMock)
      done()
    })
  })
})
