/* global describe expect it spyOn */

import { Predicates } from './predicates'
import { SchoolDataService } from './school.data.service'

let sut: SchoolDataService
let predicates: Predicates

const school = {
  urn: '1',
  name: 'test school',
  leaCode: '999',
  estabTypeGroupCode: '9',
  estabTypeCode: '26',
  estabStatusCode: '1',
  statLowAge: '7',
  statHighAge: '12'
}

describe('SchoolDataService', () => {
  it('should be defined', () => {
    expect(sut).toBeInstanceOf(SchoolDataService)
  })

  it('returns a mapped object with keys as per the mapping object', () => {
    const row = ['Town Primary School', 123456, 'extra', 'data', 9991111]
    const mapping = {
      name: 0,
      urn: 1,
      dfeNumber: 4
    }
    expect(sut.getMappedData(row, mapping)).toEqual({
      name: 'Town Primary School',
      urn: 123456,
      dfeNumber: 9991111
    })
  })

  it('calls the predicates', () => {
    spyOn(predicates, 'isSchoolOpen').and.callThrough()
    spyOn(predicates, 'isAgeInRange').and.callThrough()
    spyOn(predicates, 'isRequiredEstablishmentTypeGroup').and.callThrough()
    const res = sut.isPredicated(school)
    expect(res).toBe(true)
    expect(predicates.isSchoolOpen).toHaveBeenCalled()
    expect(predicates.isAgeInRange).toHaveBeenCalled()
    expect(predicates.isRequiredEstablishmentTypeGroup).toHaveBeenCalled()
  })
})
