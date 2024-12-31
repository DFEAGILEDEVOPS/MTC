const pupilMock = require('../mocks/pupil')
const pupilIdentificationFlagService = require('../../../services/pupil-identification-flag.service')
const moment = require('moment')

describe('addIdentificationFlags', () => {
  test('returns showDoB property as true for pupils with same fullname', () => {
    const mockPupilData = [
      { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2013-01-01'), middleNames: 'B' },
      { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2013-01-02'), middleNames: 'A' },
      { lastName: 'Taylor', foreName: 'Random', dateOfBirth: moment('2013-03-01'), middleNames: 'C' }
    ]
    const pupils = pupilIdentificationFlagService.addIdentificationFlags(mockPupilData)
    expect(pupils[0].showDoB).toBe(true)
  })

  test('returns showDoB property as false for pupils with different fullname', () => {
    const pupil1 = Object.assign({}, pupilMock)
    const pupil2 = Object.assign({}, pupilMock)
    pupil1.foreName = 'test'
    const pupils = pupilIdentificationFlagService.addIdentificationFlags([pupil1, pupil2])
    expect(pupils[0].showDoB && pupils[1].showDoB).toBeFalsy()
  })

  test('returns showMiddleNames property as true for pupils with same fullname and DoB', () => {
    const pupil1 = Object.assign({}, pupilMock)
    const pupil2 = Object.assign({}, pupilMock)
    const pupils = pupilIdentificationFlagService.addIdentificationFlags([pupil1, pupil2])
    expect(pupils[0].showMiddleNames && pupils[1].showMiddleNames).toBeTruthy()
    expect(pupils[0].middleNames).toBe('Middle')
  })

  test('returns showMiddleNames property as false for pupils with different fullname and Dob', () => {
    const pupil1 = Object.assign({}, pupilMock)
    const pupil2 = Object.assign({}, pupilMock)
    pupil1.foreName = 'test'
    const pupils = pupilIdentificationFlagService.addIdentificationFlags([pupil1, pupil2])
    expect(pupils[0].showDoB && pupils[1].showMiddleNames).toBeFalsy()
  })

  test('it returns a new object rather than modifying the argument', () => {
    const pupil1 = Object.assign({}, pupilMock)
    const pupil2 = Object.assign({}, pupilMock)
    const arg = [pupil1, pupil2]
    const pupils = pupilIdentificationFlagService.addIdentificationFlags(arg)
    expect(pupils).not.toBe(arg)
  })

  test('returns the pupil full name with middle names if pupil differentiation requires a middleName sort', () => {
    const mockPupilData = [
      { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2012-01-01'), middleNames: 'C' },
      { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2012-01-01'), middleNames: 'B' },
      { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2012-01-01'), middleNames: 'A' }
    ]
    const pupils = pupilIdentificationFlagService.sortAndAddIdentificationFlags(mockPupilData)
    expect(pupils[0].fullName).toBe('Smith, Jack A')
    expect(pupils[1].fullName).toBe('Smith, Jack B')
    expect(pupils[2].fullName).toBe('Smith, Jack C')
  })

  test('sorts the pupils alphabetically - if the lastname, forename and dob are the same it sorts by middlenames', () => {
    const mockPupilData = [
      { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2013-01-01'), middleNames: 'C' },
      { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2013-01-01'), middleNames: 'B' },
      { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2013-01-01'), middleNames: 'A' }
    ]
    const pupils = pupilIdentificationFlagService.sortAndAddIdentificationFlags(mockPupilData)
    expect(pupils[0].showMiddleNames).toBe(true)
    expect(pupils[0].showDoB).toBe(true)
    expect(pupils[0].fullName).toBe('Smith, Jack A')

    expect(pupils[1].showMiddleNames).toBe(true)
    expect(pupils[1].showDoB).toBe(true)
    expect(pupils[1].fullName).toBe('Smith, Jack B')

    expect(pupils[2].showMiddleNames).toBe(true)
    expect(pupils[2].showDoB).toBe(true)
    expect(pupils[2].fullName).toBe('Smith, Jack C')
  })

  test('it disambiguates pupils using date of birth for pupils that have the same foreName and lastName', () => {
    const mockPupilData = [
      { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2013-01-04'), middleNames: 'C' },
      { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2013-01-03'), middleNames: 'B' },
      { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2013-01-02'), middleNames: 'A' },
      { lastName: 'Taylor', foreName: 'Random', dateOfBirth: moment('2012-12-24'), middleNames: 'D' }
    ]
    const pupils = pupilIdentificationFlagService.sortAndAddIdentificationFlags(mockPupilData)
    expect(pupils[0].formattedDateOfBirth).toEqual('2 Jan 2013')
    expect(pupils[0].showDoB).toBe(true)
    expect(pupils[0].showMiddleNames).toBe(false)

    expect(pupils[1].formattedDateOfBirth).toEqual('3 Jan 2013')
    expect(pupils[1].showDoB).toBe(true)
    expect(pupils[1].showMiddleNames).toBe(false)

    expect(pupils[2].formattedDateOfBirth).toEqual('4 Jan 2013')
    expect(pupils[2].showDoB).toBe(true)
    expect(pupils[2].showMiddleNames).toBe(false)
  })

  test('it does not show middlenames when just the DoB is the same', () => {
    const mockPupilData = [
      { lastName: 'Smythe', foreName: 'John', dateOfBirth: moment('2013-01-03'), middleNames: 'A' },
      { lastName: 'Smith', foreName: 'Jack', dateOfBirth: moment('2013-01-03'), middleNames: 'B' }
    ]
    const pupils = pupilIdentificationFlagService.sortAndAddIdentificationFlags(mockPupilData)
    expect(pupils[0].showMiddleNames).toBe(false)
    expect(pupils[1].showMiddleNames).toBe(false)
  })
})
