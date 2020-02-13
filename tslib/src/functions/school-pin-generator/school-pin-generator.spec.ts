import { SchoolPinGenerator } from './school-pin-generator'

let sut: SchoolPinGenerator

describe('school-pin-generator', () => {

  test('subject is defined', () => {
    expect(sut).toBeDefined()
  })

  test.todo('allowed words must be a minimum set of 5')
  test.todo('allowed words must be sanitised for banned words before use')
  test.todo('first 3 chars of pin must be word from allowed words set')
  test.todo('chars 4 and 5 must be 2 digit number constructed from 23456789')
  test.todo('last 3 chars of pin must be word from allowed words set')
})
