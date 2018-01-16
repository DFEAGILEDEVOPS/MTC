'use strict'

/* global describe beforeEach afterEach it expect jasmine */

const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')

const Group = require('../../models/group')
const groupMock = require('../mocks/group')
const groupsMock = require('../mocks/groups')
const pupilsMock = require('../mocks/pupils-with-reason')

describe('group.service', () => {
  let service
  let sandbox

  beforeEach(() => { sandbox = sinon.sandbox.create() })
  afterEach(() => { sandbox.restore() })

  describe('#getGroups', () => {
    beforeEach(() => {
      service = proxyquire('../../services/group.service', {
        '../services/data-access/group.data.service': {
          getGroups: jasmine.createSpy().and.callFake(function () { return Promise.resolve(groupsMock) })
        },
        '../models/group': Group
      })
    })

    it('should return groups', async (done) => {
      const groups = await service.getGroups()
      expect(groups).toEqual(groupsMock)
      done()
    })
  })

  describe('#getPupils', () => {
    beforeEach(() => {
      service = proxyquire('../../services/group.service', {
        '../services/data-access/pupil.data.service': {
          getSortedPupils: jasmine.createSpy().and.callFake(function () { return Promise.resolve(pupilsMock) })
        },
        '../services/data-access/group.data.service': {
          getGroups: jasmine.createSpy().and.callFake(function () { return Promise.resolve(groupsMock) })
        },
        '../models/group': Group
      })
    })

    it('should return pupils', async (done) => {
      const schoolId = '9991001'
      const pupils = await service.getPupils(schoolId)
      expect(pupils).toEqual(pupilsMock)
      done()
    })

    it('should return false if school id is not passed', async (done) => {
      const pupils = await service.getPupils()
      expect(pupils).toBeFalsy()
      done()
    })
  })

  describe('#getGroupById', () => {
    beforeEach(() => {
      service = proxyquire('../../services/group.service', {
        '../services/data-access/group.data.service': {
          getGroup: jasmine.createSpy().and.callFake(function () { return Promise.resolve(groupMock) })
        },
        '../models/group': Group
      })
    })

    it('should return group document filtered by group id', async (done) => {
      const groupId = '123456abcde'
      const group = await service.getGroupById(groupId)
      expect(group).toEqual(groupMock)
      done()
    })

    it('should return false if group id is not passed', async (done) => {
      const group = await service.getGroupById()
      expect(group).toBeFalsy()
      done()
    })
  })

  describe('#getGroupByName', () => {
    beforeEach(() => {
      service = proxyquire('../../services/group.service', {
        '../services/data-access/group.data.service': {
          getGroup: jasmine.createSpy().and.callFake(function () { return Promise.resolve(groupMock) })
        },
        '../models/group': Group
      })
    })

    it('should return group document filtered by name', async (done) => {
      const groupName = 'Test Group 1'
      const group = await service.getGroupByName(groupName)
      expect(group).toEqual(groupMock)
      done()
    })

    it('should return false if group name is not passed', async (done) => {
      const group = await service.getGroupByName()
      expect(group).toBeFalsy()
      done()
    })
  })
})
