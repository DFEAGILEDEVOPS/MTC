import { SchoolRequiresNewPinPredicate } from './school-requires-pin-predicate'
import { type School } from './school-pin-replenishment.service'
import moment = require('moment')

describe('school-requires-new-pin-predicate', () => {
  let sut: SchoolRequiresNewPinPredicate

  beforeEach(() => {
    sut = new SchoolRequiresNewPinPredicate()
  })

  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('indicates pin required when pin is undefined', () => {
    const school: School = {
      id: 1,
      name: 'school'
    }
    expect(sut.isRequired(school)).toBe(true)
  })

  test('indicates pin not required when expiry date in future', () => {
    const school: School = {
      id: 1,
      name: 'school',
      pin: 'abc12def',
      pinExpiresAt: moment().add(1, 'hours')
    }
    expect(sut.isRequired(school)).toBe(false)
  })

  test('indicates pin required when expiry date in future but pin not defined', () => {
    const school: School = {
      id: 1,
      name: 'school',
      pin: undefined,
      pinExpiresAt: moment().add(1, 'hours')
    }
    expect(sut.isRequired(school)).toBe(true)
  })

  test('indicates pin required when expiry date not defined', () => {
    const school: School = {
      id: 1,
      name: 'school',
      pin: 'acb12def',
      pinExpiresAt: undefined
    }
    expect(sut.isRequired(school)).toBe(true)
  })

  test('indicates pin required when expiry date has passed', () => {
    const school: School = {
      id: 1,
      name: 'school',
      pin: 'acb12def',
      pinExpiresAt: moment().add(-1, 'hours')
    }
    expect(sut.isRequired(school)).toBe(true)
  })
})
