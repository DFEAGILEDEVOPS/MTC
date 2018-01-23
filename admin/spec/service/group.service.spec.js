'use strict'

/* global describe beforeEach afterEach it expect jasmine spyOn */

const proxyquire = require('proxyquire').noCallThru()
const sinon = require('sinon')

const groupService = require('../../services/group.service')
const groupDataService = require('../../services/data-access/group.data.service')
const groupMock = require('../mocks/group')
const groupsMock = require('../mocks/groups')
const pupilsPerGroupMock = require('../mocks/pupils-per-group')
const pupilsMock = require('../mocks/pupils')

describe('group.service', () => {
  let sandbox

  beforeEach(() => { sandbox = sinon.sandbox.create() })
  afterEach(() => { sandbox.restore() })

  describe('#getGroups', () => {
    beforeEach(() => {
      spyOn(groupDataService, 'sqlFindGroups').and.returnValue(groupsMock)
    })

    it('should return groups', async (done) => {
      const schoolId = 1
      const groups = await groupService.getGroups(schoolId)
      expect(groups).toEqual(groupsMock)
      done()
    })
  })

  describe('#getPupils', () => {
    beforeEach(() => {
      spyOn(groupDataService, 'sqlFindPupils').and.returnValue(pupilsMock)
    })

    it('should return pupils', async (done) => {
      const schoolId = 1
      const groupIdToExclude = 1
      const pupils = await groupService.getPupils(schoolId, groupIdToExclude)
      expect(pupils).toEqual(pupilsMock)
      done()
    })
  })

  describe('#getGroupById', () => {
    beforeEach(() => {
      spyOn(groupDataService, 'sqlFindGroup').and.returnValue(groupMock)
    })

    it('should return group document filtered by group id', async (done) => {
      const groupId = '123456abcde'
      const group = await groupService.getGroupById(groupId)
      expect(group).toEqual(groupMock)
      done()
    })
  })

  describe('#update', () => {
    let service

    describe('happy path', () => {
      beforeEach(() => {
        service = proxyquire('../../services/group.service', {
          '../services/data-access/group.data.service': {
            sqlUpdate: jasmine.createSpy().and.callFake(function () { return Promise.resolve() }),
            sqlAssignPupilsToGroup: jasmine.createSpy().and.callFake(function () { return Promise.resolve() })
          }
        })
      })

      it('should update group', async (done) => {
        const group = await service.update(1, groupMock)
        expect(group).toBeTruthy()
        done()
      })
    })

    describe('unhappy path', () => {
      beforeEach(() => {
        service = proxyquire('../../services/group.service', {
          '../services/data-access/group.data.service': {
            sqlUpdate: jasmine.createSpy().and.callFake(function () { return Promise.reject(new Error('TEST ERROR')) }),
            sqlAssignPupilsToGroup: jasmine.createSpy().and.callFake(function () { return Promise.resolve() })
          }
        })
      })

      it('should not update group', async (done) => {
        try {
          const group = await service.update(1, groupMock)
          expect(group).toEqual(groupMock)
          done()
        } catch (error) {
          expect(error.message).toBe('TEST ERROR')
          done()
        }
      })
    })
  })

  describe('#create', () => {
    let service

    describe('happy path', () => {
      beforeEach(() => {
        service = proxyquire('../../services/group.service', {
          '../services/data-access/group.data.service': {
            sqlCreate: jasmine.createSpy().and.callFake(function () { return Promise.resolve({'insertId': 1}) }),
            sqlAssignPupilsToGroup: jasmine.createSpy().and.callFake(function () { return Promise.resolve() })
          }
        })
      })

      it('should create group', async (done) => {
        const group = await service.create(groupMock.name, [6, 2, 3])
        expect(group).toEqual(groupMock.id)
        done()
      })
    })

    describe('unhappy path', () => {
      beforeEach(() => {
        service = proxyquire('../../services/group.service', {
          '../services/data-access/group.data.service': {
            sqlCreate: jasmine.createSpy().and.callFake(function () { return Promise.reject(new Error('Failed to create group')) }),
            sqlAssignPupilsToGroup: jasmine.createSpy().and.callFake(function () { return Promise.resolve() })
          }
        })
      })

      it('should fail to create a group', async (done) => {
        try {
          await service.create(groupMock, [6, 2, 3])
        } catch (error) {
          expect(error.message).toBe('Failed to create group')
          done()
        }
      })
    })
  })
})
