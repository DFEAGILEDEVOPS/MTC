'use strict'

/* global describe, beforeEach, afterEach, it, expect */

const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
require('sinon-mongoose')

const Group = require('../../../models/group')
const groupsMock = require('../../mocks/groups')

describe('GroupDataService', () => {
  let service
  let sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => sandbox.restore())

  describe('#groupDataService', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(Group).expects('find').chain('sort').chain('lean').chain('exec').resolves(groupsMock)
      service = proxyquire('../../../services/data-access/group.data.service', {
        '../../models/group': Group
      })
    })

    it('should fetch groups', async () => {
      await service.fetchGroups()
      expect(mock.verify()).toBe(true)
    })
  })
})
