const sut = require('../../../../lib/validator/school-validator')
const laCodeValidator = require('../../../../lib/validator/la-code-validator')
const ValidationError = require('../../../../lib/validation-error')

describe('school validator', () => {
  test('fails if the school name is empty', async () => {
    jest.spyOn(laCodeValidator, 'validate').mockResolvedValue(new ValidationError())
    const update = { name: '' }
    const ve = await sut.validate(update)
    expect(ve.isError('name')).toBe(true)
  })

  test('fails if the dfeNumber is not a number', async () => {
    jest.spyOn(laCodeValidator, 'validate').mockResolvedValue(new ValidationError())
    const update = { dfeNumber: 'abc' }
    const ve = await sut.validate(update)
    expect(ve.isError('dfeNumber')).toBe(true)
  })

  test('fails if the URN is not a number', async () => {
    jest.spyOn(laCodeValidator, 'validate').mockResolvedValue(new ValidationError())
    const update = { urn: 'abc' }
    const ve = await sut.validate(update)
    expect(ve.isError('urn')).toBe(true)
  })

  test('fails if the leaCode is not a number', async () => {
    jest.spyOn(laCodeValidator, 'validate').mockResolvedValue(new ValidationError())
    const update = { leaCode: 'abc' }
    const ve = await sut.validate(update)
    expect(ve.isError('leaCode')).toBe(true)
  })

  test('fails if the estabCode is not a number', async () => {
    jest.spyOn(laCodeValidator, 'validate').mockResolvedValue(new ValidationError())
    const update = { estabCode: 'abc' }
    const ve = await sut.validate(update)
    expect(ve.isError('estabCode')).toBe(true)
  })

  test('fails if the leaCode is not known', async () => {
    jest.spyOn(laCodeValidator, 'validate').mockResolvedValue(new ValidationError('leaCode', 'unit test'))
    const update = { leaCode: 999 }
    const ve = await sut.validate(update)
    expect(ve.isError('leaCode')).toBe(true)
  })

  test('passes on the happy path', async () => {
    jest.spyOn(laCodeValidator, 'validate').mockResolvedValue(new ValidationError())
    const update = {
      name: 'Test school',
      leaCode: 999,
      estabCode: 111,
      dfeNumber: 999111,
      urn: 888100,
      typeOfEstablishmentCode: 10
    }
    const ve = await sut.validate(update)
    expect(ve.hasError()).toBe(false)
  })

  test('fails if the typeOfEstablishmentCode is missing', async () => {
    jest.spyOn(laCodeValidator, 'validate').mockResolvedValue(new ValidationError())
    const update = {
      name: 'Test school',
      leaCode: 999,
      estabCode: 111,
      dfeNumber: 999111,
      urn: 888100
    }
    const ve = await sut.validate(update)
    expect(ve.hasError()).toBe(true)
    expect(ve.get('typeOfEstablishmentCode')).toEqual('Invalid Type Of Establishment code: undefined')
  })

  test('fails if the typeOfEstablishmentCode is null', async () => {
    jest.spyOn(laCodeValidator, 'validate').mockResolvedValue(new ValidationError())
    const update = {
      name: 'Test school',
      leaCode: 999,
      estabCode: 111,
      dfeNumber: 999111,
      urn: 888100,
      typeOfEstablishmentCode: null
    }
    const ve = await sut.validate(update)
    expect(ve.hasError()).toBe(true)
    expect(ve.get('typeOfEstablishmentCode')).toEqual('Invalid Type Of Establishment code: null')
  })

  test('fails if the typeOfEstablishmentCode is null', async () => {
    jest.spyOn(laCodeValidator, 'validate').mockResolvedValue(new ValidationError())
    const update = {
      name: 'Test school',
      leaCode: 999,
      estabCode: 111,
      dfeNumber: 999111,
      urn: 888100,
      typeOfEstablishmentCode: ''
    }
    const ve = await sut.validate(update)
    expect(ve.hasError()).toBe(true)
    expect(ve.get('typeOfEstablishmentCode')).toEqual('Invalid Type Of Establishment code: ')
  })

  test('fails if the typeOfEstablishmentCode is 0', async () => {
    jest.spyOn(laCodeValidator, 'validate').mockResolvedValue(new ValidationError())
    const update = {
      name: 'Test school',
      leaCode: 999,
      estabCode: 111,
      dfeNumber: 999111,
      urn: 888100,
      typeOfEstablishmentCode: 0
    }
    const ve = await sut.validate(update)
    expect(ve.hasError()).toBe(true)
    expect(ve.get('typeOfEstablishmentCode')).toEqual('Please choose one of the establishment types')
  })
})
