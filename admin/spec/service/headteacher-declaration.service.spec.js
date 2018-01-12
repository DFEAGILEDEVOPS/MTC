'use strict'
/* global describe it expect beforeEach spyOn */

const headteacherDeclarationDataService = require('../../services/data-access/headteacher-declaration.data.service')
const schoolDataService = require('../../services/data-access/school.data.service')
const sqlResponseMock = require('../mocks/sql-modify-response')
const schoolMock = require('../mocks/school')

describe('headteacherDeclarationService', () => {
  describe('#declare', () => {
    let controller
    const form = {
      jobTitle: 'Head',
      fullName: 'Hubert J. Farnsworth',
      declaration: 'signed'
    }

    beforeEach(() => {
      spyOn(headteacherDeclarationDataService, 'sqlCreate').and.returnValue(Promise.resolve(sqlResponseMock))
      spyOn(schoolDataService, 'sqlFindOneByDfeNumber').and.returnValue(Promise.resolve(schoolMock))
      /**
       * @type headteacherDeclarationService
       */
      controller = require('../../services/headteacher-declaration.service')
    })

    it('calls the headteacher data service', async () => {
      const schoolId = 42
      const userId = 777
      await controller.declare(form, schoolId, userId)
      expect(headteacherDeclarationDataService.sqlCreate).toHaveBeenCalled()
    })

    it('adds a signedDate field to the form', async () => {
      const schoolId = 42
      const userId = 777
      await controller.declare(form, schoolId, userId)
      const arg = headteacherDeclarationDataService.sqlCreate.calls.mostRecent().args[0]
      expect(arg.signedDate).toBeTruthy()
    })

    it('adds the userId to the form', async () => {
      const schoolId = 42
      const userId = 777
      await controller.declare(form, schoolId, userId)
      const arg = headteacherDeclarationDataService.sqlCreate.calls.mostRecent().args[0]
      expect(arg.user_id).toBe(userId)
    })

    it('adds the schoolId to the form', async () => {
      const schoolId = 42
      const userId = 777
      await controller.declare(form, schoolId, userId)
      const arg = headteacherDeclarationDataService.sqlCreate.calls.mostRecent().args[0]
      expect(arg.school_id).toBe(schoolMock.id)
    })
  })
})
