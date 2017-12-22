'use strict'

/* global describe, beforeEach, afterEach, it, expect */

const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')
require('sinon-mongoose')

const Group = require('../../../models/group')
const groupsMock = require('../../mocks/groups')
const groupMock = require('../../mocks/group')

describe('GroupDataService', () => {
  let service
  let sandbox

  beforeEach(() => {
    sandbox = sinon.sandbox.create()
  })

  afterEach(() => sandbox.restore())

  describe('#getGroups', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(Group).expects('find').chain('collation').chain('sort').chain('lean').chain('exec').resolves(groupsMock)
      service = proxyquire('../../../services/data-access/group.data.service', {
        '../../models/group': Group
      })
    })

    it('should fetch groups', async () => {
      await service.getGroups()
      expect(mock.verify()).toBe(true)
    })
  })

  describe('#getGroup', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(Group).expects('findOne').chain('lean').chain('exec').resolves(groupMock)
      service = proxyquire('../../../services/data-access/group.data.service', {
        '../../models/group': Group
      })
    })

    it('should fetch group document', async () => {
      await service.getGroup({ name: 'Test Group 1' })
      expect(mock.verify()).toBe(true)
    })
  })

  describe('#create', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(Group.prototype).expects('save').resolves(groupMock)
      service = proxyquire('../../../services/data-access/group.data.service', {
        '../../models/group': Group
      })
    })

    it('should create a document', async () => {
      await service.create({ name: 'Test Group 1', pupils: ['5a324c40c9decb39628b84a2', '5a324c40c9decb39628b84a3', '5a324c40c9decb39628b84a4'] })
      expect(mock.verify()).toBe(true)
    })
  })

  describe('#update', () => {
    let mock

    beforeEach(() => {
      mock = sandbox.mock(Group).expects('findByIdAndUpdate')
      service = proxyquire('../../../services/data-access/group.data.service', {
        '../../models/group': Group
      })
    })

    it('should update a document', async () => {
      let group = {}
      group.name = 'Test Group 1'
      group.pupils = ['5a324c40c9decb39628b84a2', '5a324c40c9decb39628b84a3', '5a324c40c9decb39628b84a4']
      await service.update('123456abcde', group)
      expect(mock.verify()).toBe(true)
    })
  })
})
