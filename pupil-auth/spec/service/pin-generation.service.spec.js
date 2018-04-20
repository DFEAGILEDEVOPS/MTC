'use strict'
/* global describe, beforeEach, it, expect, spyOn, fail */

const pupilDataService = require('../../services/data-access/pupil.data.service')
const pinGenerationService = require('../../services/pin-generation.service')

const pupilMock = require('../mocks/pupil')

describe('pin-generation.service', () => {
  describe('updatePupilPins', () => {
    let pupilArray, submittedIds, storedPupilsWithPins, duplicateKeyError
    beforeEach(() => {
      pupilArray = []
      for (let i = 0; i <= 20; i++) {
        const pupil = Object.assign({}, pupilMock)
        pupil.id = i + 1
        pupil.pin = undefined
        pupil.pinExpiresAt = undefined
        pupilArray.push(pupil)
      }
      storedPupilsWithPins = (min, max) => pupilArray.filter(p => p.id >= min && p.id <= max).map((p, i) => {
        p.pin = i * 1111
        return p
      })
      submittedIds = pupilArray.map(p => p.id)

      duplicateKeyError = {
        message: `Cannot insert duplicate key row in object 'mtc_admin.pupil' 
        with unique index 'pupil_school_id_pin_uindex'.`,
        code: 'EREQUEST',
        number: 2601,
        state: 1,
        class: 14,
        serverName: '2bc0b49d251c',
        procName: '',
        lineNumber: 4
      }
    })
    it('should throw an error when received data structure is not an array', async () => {
      try {
        await pinGenerationService.updatePupilPins(new Set(pupilArray), 9991999, 100, 100)
        fail('expected to throw')
      } catch (error) {
        expect(error.message).toBe('Received list of pupils is not an array')
      }
    })
    it('should generate pin and execute update when pins have not been generated', async () => {
      spyOn(pupilDataService, 'sqlUpdatePinsBatch')
      spyOn(pupilDataService, 'sqlFindByIds').and.callFake((list) => pupilArray.filter(p => list.includes(p.id)))
      await pinGenerationService.updatePupilPins(submittedIds, 9991999, 100, 100)
      const data = pupilArray.map(p => ({ id: p.id, pin: p.pin, pinExpiresAt: p.pinExpiresAt }))
      expect(pupilDataService.sqlUpdatePinsBatch).toHaveBeenCalledWith(data)
      expect(pupilDataService.sqlUpdatePinsBatch).toHaveBeenCalledTimes(1)
    })

    describe('retry generating existing pins process', () => {
      let sqlFindByIdsSpy, sqlUpdatePinsBatchSpy
      beforeEach(() => {
        sqlFindByIdsSpy = spyOn(pupilDataService, 'sqlFindByIds')
        sqlFindByIdsSpy.and.callFake((list) => pupilArray.filter(p => list.includes(p.id)))
        sqlUpdatePinsBatchSpy = spyOn(pupilDataService, 'sqlUpdatePinsBatch')
      })
      it('should not occur when the error is not related to pin duplication', async () => {
        const error = { number: 1, message: 'test' }
        sqlUpdatePinsBatchSpy.and.returnValue(Promise.reject(error))
        try {
          await pinGenerationService.updatePupilPins(submittedIds, 9991999, 100, 100)
          fail('expected to throw')
        } catch (error) {
          expect(sqlUpdatePinsBatchSpy).toHaveBeenCalledTimes(1)
        }
      })
      it('should occur when sqlUpdatePinsBatch throws duplicate key error and max attempts are not reached', async () => {
        // sqlUpdatePins fails the first time, second time and then succeeds
        sqlUpdatePinsBatchSpy.and.returnValues(
          Promise.reject(duplicateKeyError),
          Promise.reject(duplicateKeyError),
          Promise.resolve('ok')
        )
        const unsavedPupilsMock = (max) => pupilArray.filter(p => p.id < max)
        const unsavedPupilIdsMock = (max) => unsavedPupilsMock(max).map(p => p.id)
        spyOn(pupilDataService, 'sqlFindPupilsWithActivePins').and.returnValues(
          storedPupilsWithPins(6, pupilArray.length),
          storedPupilsWithPins(5, pupilArray.length)
        )
        try {
          await pinGenerationService.updatePupilPins(submittedIds, 9991999, 100, 100)
        } catch (error) {
          fail('not expected to throw')
        }
        expect(pupilDataService.sqlUpdatePinsBatch).toHaveBeenCalledTimes(3)
        expect(sqlFindByIdsSpy.calls.all()[ 1 ].args[ 0 ]).toEqual(unsavedPupilIdsMock(6))
        expect(sqlFindByIdsSpy.calls.all()[ 2 ].args[ 0 ]).toEqual(unsavedPupilIdsMock(5))
        const updateArgs = (i) => sqlUpdatePinsBatchSpy.calls.all()[ i ].args[ 0 ]
        const updateArgsIds = (i) => updateArgs(i).map(p => p.id)
        const updateArgsPins = (i) => updateArgs(i).map(p => p.pin).filter(p => !!p)
        expect(updateArgsIds(1)).toEqual(unsavedPupilIdsMock(6))
        expect(updateArgsPins(1).length).toBe(unsavedPupilsMock(6).length)
        expect(updateArgsIds(2)).toEqual(unsavedPupilIdsMock(5))
        expect(updateArgsPins(2).length).toBe(unsavedPupilsMock(5).length)
      })
      it('should occur when sqlUpdatePinsBatch throws duplicate key error and throw another error when max attempts are reached', async () => {
        const sqlUpdatePinsBatchReturnValues = Array(101).fill(Promise.reject(duplicateKeyError))
        sqlUpdatePinsBatchSpy.and.returnValues(...sqlUpdatePinsBatchReturnValues)
        const sqlFindPupilsWithActivePinsValues = Array(100).fill(storedPupilsWithPins(4))
        spyOn(pupilDataService, 'sqlFindPupilsWithActivePins').and.returnValues(...sqlFindPupilsWithActivePinsValues)
        try {
          await pinGenerationService.updatePupilPins(submittedIds, 9991999, 100, 100)
          fail('expected to throw')
        } catch (error) {
          expect(error.message).toEqual(`100 allowed attempts 
      for pin generation resubmission have been reached`)
          expect(pupilDataService.sqlUpdatePinsBatch).toHaveBeenCalledTimes(101)
        }
      })
    })
  })
})
