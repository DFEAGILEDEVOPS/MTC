/* global describe, it, expect */
const pupilMock = require('../mocks/pupil')
const pupilIdentificationFlagService = require('../../services/pupil-identification-flag.service')

describe('addIdentificationFlags', () => {
  it('returns showDoB property as true for pupils with same fullname', () => {
    const pupil1 = Object.assign({}, pupilMock)
    const pupil2 = Object.assign({}, pupilMock)
    const pupils = pupilIdentificationFlagService.addIdentificationFlags([pupil1, pupil2])
    expect(pupils[0].showDoB && pupils[1].showDoB).toBeTruthy()
  })
  it('returns showDoB property as false for pupils with different fullname', () => {
    const pupil1 = Object.assign({}, pupilMock)
    const pupil2 = Object.assign({}, pupilMock)
    pupil1.foreName = 'test'
    const pupils = pupilIdentificationFlagService.addIdentificationFlags([pupil1, pupil2])
    expect(pupils[0].showDoB && pupils[1].showDoB).toBeFalsy()
  })
  it('returns showMiddleNames property as true for pupils with same fullname and DoB', () => {
    const pupil1 = Object.assign({}, pupilMock)
    const pupil2 = Object.assign({}, pupilMock)
    const pupils = pupilIdentificationFlagService.addIdentificationFlags([pupil1, pupil2])
    expect(pupils[0].showDoB && pupils[1].middleNames).toBeTruthy()
    expect(pupils[0].middleNames).toBe('Middle')
  })
  it('returns showMiddleNames property as false for pupils with different fullname and Dob', () => {
    const pupil1 = Object.assign({}, pupilMock)
    const pupil2 = Object.assign({}, pupilMock)
    pupil1.foreName = 'test'
    const pupils = pupilIdentificationFlagService.addIdentificationFlags([pupil1, pupil2])
    expect(pupils[0].showDoB && pupils[1].showMiddleNames).toBeFalsy()
  })
})
