'use strict'

const groupService = require('../../../services/group.service')
const groupDataService = require('../../../services/data-access/group.data.service')
const redisCacheService = require('../../../services/data-access/redis-cache.service')
const redisKeyService = require('../../../services/redis-key.service')
const groupMock = require('../mocks/group')
const groupsMock = require('../mocks/groups')
const pupilsMock = require('../mocks/pupils')
const groupsNamesMock = groupsMock.map(g => g.name)

describe('group.service', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('#getGroups', () => {
    beforeEach(() => {
      return jest.spyOn(groupDataService, 'sqlFindGroups').mockReturnValue(groupsMock)
    })

    test('should return groups', async () => {
      const schoolId = 1
      const groups = await groupService.getGroups(schoolId)
      expect(groups).toEqual(groupsMock)
      expect(groupDataService.sqlFindGroups).toHaveBeenCalled()
    })
  })

  describe('#getGroupsWithPresentPupils', () => {
    beforeEach(() => {
      jest.spyOn(groupDataService, 'sqlFindGroupsWithAtleastOnePresentPupil').mockReturnValue(groupsMock)
    })

    test('should return groups', async () => {
      const schoolId = 1
      const groups = await groupService.getGroupsWithPresentPupils(schoolId)
      expect(groups).toEqual(groupsMock)
      expect(groupDataService.sqlFindGroupsWithAtleastOnePresentPupil).toHaveBeenCalled()
    })
  })

  describe('#getGroupsAsArray', () => {
    describe('happy path', () => {
      beforeEach(() => {
        jest.spyOn(groupDataService, 'sqlFindGroups').mockReturnValue(groupsMock)
      })

      test('should return groups', async () => {
        const schoolId = 1
        const groups = await groupService.getGroupsAsArray(schoolId)
        expect(groups[1]).toEqual('Test Group 1')
        expect(groups[2]).toEqual('Test Group 2')
        expect(groups[3]).toEqual('Test Group 3')
      })

      test('should return an error if schoolId is missing', async () => {
        const schoolId = null
        try {
          await groupService.getGroupsAsArray(schoolId)
          fail('error not thrown')
        } catch (error) {
          expect(error.message).toEqual('schoolId is required')
        }
      })
    })
  })

  describe('#getPupils', () => {
    beforeEach(() => {
      jest.spyOn(groupDataService, 'sqlFindPupilsInNoGroupOrSpecificGroup').mockReturnValue(pupilsMock)
    })

    test('should return sorted pupils', async () => {
      const schoolId = 1
      const groupIdToExclude = 1
      const pupils = await groupService.getPupils(schoolId, groupIdToExclude)
      expect(Array.isArray(pupils)).toBe(true)
      expect(pupils[0].lastName).toBe('Clooney')
      expect(pupils[1].lastName).toBe('Lincoln')
      expect(pupils[2].lastName).toBe('Tesla')
    })

    test('should return an error if schoolId is missing', async () => {
      const schoolId = null
      const groupIdToExclude = 1
      try {
        await groupService.getPupils(schoolId, groupIdToExclude)
        fail('error not thrown')
      } catch (error) {
        expect(error.message).toEqual('schoolId is required')
      }
    })
  })

  describe('#getGroupById', () => {
    beforeEach(() => {
      jest.spyOn(groupDataService, 'sqlFindOneById').mockReturnValue(groupMock)
    })

    test('should return group document filtered by group id', async () => {
      const groupId = '123456abcde'
      const schoolId = 123
      const group = await groupService.getGroupById(groupId, schoolId)
      expect(group).toEqual(groupMock)
    })

    test('should return an error if schoolId or groupId are missing', async () => {
      const groupId = '123456abcde'
      const schoolId = null
      try {
        await groupService.getGroupById(groupId, schoolId)
        fail('error not thrown')
      } catch (error) {
        expect(error.message).toEqual('schoolId and groupId are required')
      }
    })
  })

  describe('#update', () => {
    let service
    const userId = 123

    describe('happy path', () => {
      beforeEach(() => {
        service = require('../../../services/group.service')
        jest.spyOn(groupDataService, 'sqlUpdate').mockResolvedValue()
        jest.spyOn(groupDataService, 'sqlModifyGroupMembers').mockImplementation()
        jest.spyOn(service, 'getPupils').mockResolvedValue(pupilsMock)
        jest.spyOn(redisCacheService, 'drop').mockImplementation()
        jest.spyOn(redisKeyService, 'getPupilRegisterViewDataKey')
      })

      test('should update group (including pupils)', async () => {
        const schoolId = 123
        const thisGroupMock = JSON.parse(JSON.stringify(groupMock))
        thisGroupMock.pupils = [2]
        await service.update(1, thisGroupMock, schoolId, userId)
        expect(groupDataService.sqlUpdate).toHaveBeenCalled()
        expect(groupDataService.sqlModifyGroupMembers).toHaveBeenCalledWith(thisGroupMock.id, thisGroupMock.pupils, userId)
      })

      test('should update group (including pupils) when sent as an object', async () => {
        const schoolId = 123
        const thisGroupMock = JSON.parse(JSON.stringify(groupMock))
        thisGroupMock.pupils = { 2: 2 }
        await service.update(1, thisGroupMock, schoolId, userId)
        expect(groupDataService.sqlUpdate).toHaveBeenCalled()
        expect(groupDataService.sqlModifyGroupMembers).toHaveBeenCalled()
      })

      test('should update group (excluding pupils when they are the same)', async () => {
        const schoolId = 123
        const thisGroupMock = JSON.parse(JSON.stringify(groupMock))
        thisGroupMock.pupils = [3]
        await service.update(1, thisGroupMock, schoolId, userId)
        expect(groupDataService.sqlUpdate).toHaveBeenCalled()
        expect(groupDataService.sqlModifyGroupMembers).toHaveBeenCalledTimes(0)
      })

      test('should trim whitespace from name', async () => {
        const schoolId = 123
        const thisGroupMock = JSON.parse(JSON.stringify(groupMock))
        thisGroupMock.name = 'Test '
        await service.update(1, thisGroupMock, schoolId, userId)
        expect(groupDataService.sqlUpdate).toHaveBeenCalledWith(thisGroupMock.id, 'Test', schoolId)
      })
    })

    describe('unhappy path', () => {
      beforeEach(() => {
        service = require('../../../services/group.service')
        jest.spyOn(groupDataService, 'sqlUpdate').mockResolvedValue()
        jest.spyOn(groupDataService, 'sqlModifyGroupMembers').mockImplementation()
        jest.spyOn(redisCacheService, 'drop').mockImplementation()
        jest.spyOn(redisKeyService, 'getPupilRegisterViewDataKey').mockImplementation()
      })

      test('should return an error if userId is missing', async () => {
        const schoolId = 456
        try {
          await service.update(1, groupMock, schoolId, undefined)
          fail('error not thrown')
        } catch (error) {
          expect(error.message).toEqual('id, group.name, schoolId and userId are required')
        }
      })

      test('should return an error if schoolId is missing', async () => {
        const schoolId = null
        try {
          await service.update(1, groupMock, schoolId, userId)
          fail('error not thrown')
        } catch (error) {
          expect(error.message).toEqual('id, group.name, schoolId and userId are required')
        }
      })
    })

    describe('unhappy path', () => {
      beforeEach(() => {
        service = require('../../../services/group.service')
        jest.spyOn(groupDataService, 'sqlUpdate').mockRejectedValue(new Error('Failed to update group'))
        jest.spyOn(groupDataService, 'sqlModifyGroupMembers').mockResolvedValue()
        jest.spyOn(redisCacheService, 'drop').mockImplementation()
        jest.spyOn(redisKeyService, 'getPupilRegisterViewDataKey').mockImplementation()
      })

      test('should not update group', async () => {
        try {
          const schoolId = 123
          const group = await service.update(1, groupMock, schoolId, userId)
          fail('error not thrown')
          expect(group).toEqual(groupMock)
        } catch (error) {
          expect(error.message).toBe('Failed to update group')
        }
      })
    })
  })

  describe('#create', () => {
    let service
    const userId = 456
    const createdGroupId = 789

    describe('happy path', () => {
      beforeEach(() => {
        service = require('../../../services/group.service')
        jest.spyOn(groupDataService, 'sqlCreate').mockResolvedValue({ insertId: createdGroupId })
        jest.spyOn(groupDataService, 'sqlModifyGroupMembers').mockImplementation()
        jest.spyOn(redisCacheService, 'drop').mockImplementation()
        jest.spyOn(redisKeyService, 'getPupilRegisterViewDataKey').mockImplementation()
      })

      test('should create group', async () => {
        const schoolId = 123
        const group = await service.create(groupMock.name, [6, 2, 3], schoolId, userId)
        expect(group).toEqual(createdGroupId)
      })

      test('should trim whitespace from name', async () => {
        const schoolId = 123
        await service.create('Test ', [6, 2, 3], schoolId, userId)
        expect(groupDataService.sqlCreate).toHaveBeenCalledWith({ name: 'Test', school_id: schoolId })
      })

      test('should call data service to add group members', async () => {
        const schoolId = 123
        const pupils = [6, 2, 3]
        await service.create('my group', pupils, schoolId, userId)
        expect(groupDataService.sqlModifyGroupMembers).toHaveBeenCalledWith(createdGroupId, pupils, userId)
      })
    })

    describe('unhappy path', () => {
      beforeEach(() => {
        service = require('../../../services/group.service')
        jest.spyOn(groupDataService, 'sqlCreate').mockResolvedValue({ insertId: 1 })
        jest.spyOn(groupDataService, 'sqlModifyGroupMembers').mockImplementation()
        jest.spyOn(redisCacheService, 'drop').mockImplementation()
        jest.spyOn(redisKeyService, 'getPupilRegisterViewDataKey').mockImplementation()
      })

      test('should return an error if schoolId is missing', async () => {
        const schoolId = null
        try {
          await service.create(groupMock.name, [6, 2, 3], schoolId, userId)
          fail('error not thrown')
        } catch (error) {
          expect(error.message).toEqual('groupName, schoolId and userId are required')
        }
      })

      test('should return an error if groupName is missing', async () => {
        const schoolId = 123
        try {
          await service.create(undefined, [6, 2, 3], schoolId, userId)
          fail('error not thrown')
        } catch (error) {
          expect(error.message).toEqual('groupName, schoolId and userId are required')
        }
      })

      test('should return an error if userId is missing', async () => {
        const schoolId = 123
        try {
          await service.create(undefined, [6, 2, 3], schoolId, undefined)
          fail('error not thrown')
        } catch (error) {
          expect(error.message).toEqual('groupName, schoolId and userId are required')
        }
      })
    })

    describe('unhappy path 2', () => {
      beforeEach(() => {
        service = require('../../../services/group.service')
        jest.spyOn(groupDataService, 'sqlCreate').mockRejectedValue(new Error('Failed to create group'))
        jest.spyOn(groupDataService, 'sqlModifyGroupMembers').mockImplementation()
        jest.spyOn(redisCacheService, 'drop').mockImplementation()
        jest.spyOn(redisKeyService, 'getPupilRegisterViewDataKey').mockImplementation()
      })

      test('should fail to create a group', async () => {
        try {
          const schoolId = 123
          await service.create(groupMock.name, [6, 2, 3], schoolId, userId)
          fail('error not thrown')
        } catch (error) {
          expect(error.message).toBe('Failed to create group')
        }
      })
    })
  })

  describe('#findGroupsByPupil', () => {
    beforeEach(() => {
      jest.spyOn(groupDataService, 'sqlFindGroupsByIds').mockResolvedValue(groupsMock)
    })

    test('should return groups that have pupils', async () => {
      const schoolId = 1
      const pupilIds = [1, 2, 3, 4]
      const groups = await groupService.findGroupsByPupil(schoolId, pupilIds)
      expect(groups).toEqual(groupsMock)
    })

    test('should return an error if no pupil id', async () => {
      const schoolId = 1
      const pupilIds = null

      try {
        await groupService.findGroupsByPupil(schoolId, pupilIds)
        fail('error not thrown')
      } catch (error) {
        expect(error.message).toEqual('schoolId and pupils are required')
      }
    })
  })

  describe('#assignGroupsToPupils', () => {
    beforeEach(() => {
      jest.spyOn(groupService, 'getGroupsAsArray').mockResolvedValue(groupsNamesMock)
    })

    test('should return pupils with groups added', async () => {
      const schoolId = 1
      const pupils = await groupService.assignGroupsToPupils(schoolId, pupilsMock)
      expect(pupils.length).toBe(pupilsMock.length)
      expect(pupils[0].group).toEqual('')
      expect(pupils[1].group).toEqual('')
      expect(pupils[2].group).toEqual(groupsMock[1].name)
    })

    test('should return an empty array if there are no pupils', async () => {
      const schoolId = 1
      const pupils = await groupService.assignGroupsToPupils(schoolId, [])
      expect(pupils).toEqual([])
    })

    test('should return the pupils mock if there are no groups', async () => {
      const schoolId = null
      const pupils = await groupService.assignGroupsToPupils(schoolId, pupilsMock)
      expect(pupils).toEqual(pupilsMock)
    })
  })

  describe('remove', () => {
    beforeEach(() => {
      jest.spyOn(redisKeyService, 'getPupilRegisterViewDataKey').mockImplementation()
      jest.spyOn(redisCacheService, 'drop').mockImplementation()
      jest.spyOn(groupDataService, 'sqlMarkGroupAsDeleted').mockImplementation()
    })

    test('should throw if schoolId is not provided', async () => {
      const schoolId = null
      const groupId = 1
      try {
        await groupService.remove(schoolId, groupId)
        fail()
      } catch (error) {
        expect(error.message).toBe('schoolId is required')
      }
    })

    test('should throw if groupId is not provided', async () => {
      const schoolId = 1
      const groupId = null
      try {
        await groupService.remove(schoolId, groupId)
        fail()
      } catch (error) {
        expect(error.message).toBe('groupId is required')
      }
    })

    test('should throw if userId is not provided', async () => {
      await expect(groupService.remove(123, 4, undefined)).rejects.toThrow('userId is required')
    })

    test('should get the pupil register redis key, invalidate the relevant cache value and perform soft delete', async () => {
      const schoolId = 1
      const groupId = 2
      const userId = 3
      try {
        await groupService.remove(schoolId, groupId, userId)
        expect(redisKeyService.getPupilRegisterViewDataKey).toHaveBeenCalled()
        expect(redisCacheService.drop).toHaveBeenCalled()
        expect(groupDataService.sqlMarkGroupAsDeleted).toHaveBeenCalledWith(groupId, schoolId, userId)
      } catch {
        fail()
      }
    })
  })
})
