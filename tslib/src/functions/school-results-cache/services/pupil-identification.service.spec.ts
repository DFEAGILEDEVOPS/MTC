import moment from 'moment'
import { type IPupilIdentificationService, PupilIdentificationService } from './pupil-identification.service'

describe('pupil-identification.service', () => {
  let sut: IPupilIdentificationService

  beforeEach(() => {
    sut = new PupilIdentificationService()
  })

  test('If two pupils have the same surname and forename, it uses the date of birth to differentiate', () => {
    const mockData = [
      {
        lastName: 'Burton',
        foreName: 'Greg',
        middleNames: '',
        dateOfBirth: moment().subtract(8, 'years'),
        group_id: null,
        score: 1,
        urlSlug: '',
        status: ''
      },
      {
        lastName: 'Burton',
        foreName: 'Greg',
        middleNames: '',
        dateOfBirth: moment().subtract(7.9, 'years'),
        group_id: null,
        score: 1,
        urlSlug: '',
        status: ''
      }
    ]
    const result = sut.addIdentificationFlags(mockData)
    expect(result[0].showDoB).toBe(true)
    expect(result[1].showDoB).toBe(true)
  })

  test('If two pupils have the same surname, forename and date of birth, it differentiates on the middle names', () => {
    const anEightYearOld = moment().subtract(8, 'years')
    const mockData = [
      {
        lastName: 'Burton',
        foreName: 'Greg',
        middleNames: 'Zoro',
        dateOfBirth: anEightYearOld,
        group_id: null,
        score: 1,
        urlSlug: '',
        status: ''
      },
      {
        lastName: 'Chapman',
        foreName: 'Bruce',
        middleNames: 'Fred',
        dateOfBirth: moment().subtract(8, 'years'),
        group_id: null,
        score: 1,
        urlSlug: '',
        status: ''
      },
      {
        lastName: 'Burton',
        foreName: 'Greg',
        middleNames: 'Alfredo',
        dateOfBirth: anEightYearOld,
        group_id: null,
        score: 1,
        urlSlug: '',
        status: ''
      }
    ]

    const result = sut.addIdentificationFlags(mockData)

    expect(result[0].showMiddleNames).toBe(true)
    expect(result[0].showDoB).toBe(false)
    expect(result[0].fullName).toBe('Burton, Greg Zoro')
    expect(result[1].showMiddleNames).toBe(false)
    expect(result[1].fullName).toBe('Chapman, Bruce')
    expect(result[1].showDoB).toBe(false)
    expect(result[2].showMiddleNames).toBe(true)
    expect(result[2].showDoB).toBe(false)
    expect(result[2].fullName).toBe('Burton, Greg Alfredo')

    // implicit in this test is that it preserves ordering
  })

  test('if the names are different it doenst show dob or middle names', () => {
    const mockData = [
      {
        lastName: 'Allen',
        foreName: 'Greg',
        middleNames: 'Zoro',
        dateOfBirth: moment(),
        group_id: null,
        score: 1,
        urlSlug: '',
        status: ''
      },
      {
        lastName: 'Chapman',
        foreName: 'Jane',
        middleNames: 'Michelle',
        dateOfBirth: moment(),
        group_id: null,
        score: 1,
        urlSlug: '',
        status: ''
      },
      {
        lastName: 'Brown',
        foreName: 'Greg',
        middleNames: 'Alfredo',
        dateOfBirth: moment(),
        group_id: null,
        score: 1,
        urlSlug: '',
        status: ''
      }
    ]
    const result = sut.addIdentificationFlags(mockData)
    result.forEach(o => {
      expect(o.showDoB).toBe(false)
      expect(o.showMiddleNames).toBe(false)
      expect(o.fullName).toBe(`${o.lastName}, ${o.foreName}`)
    })
  })

  test('it formats the dateOfBirth property to be the GDS short date', () => {
    const dob = moment.utc('2010-12-25')
    const mockData = [
      { lastName: 'Allen', foreName: 'Greg', middleNames: 'Zoro', dateOfBirth: dob, group_id: null, score: 1, urlSlug: '', status: '' }
    ]
    const result = sut.addIdentificationFlags(mockData)
    expect(result[0].dateOfBirth).toBe('25 Dec 2010')
  })
})
