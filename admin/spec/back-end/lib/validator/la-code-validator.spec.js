const sut = require('../../../../lib/validator/la-code-validator')
const laCodeService = require('../../../../services/la-code.service')

describe('la code validator', () => {
  test('it passes validation if the la code is found in the known list', async () => {
    jest.spyOn(laCodeService, 'getLaCodes').mockResolvedValue([100, 202, 999])
    const validationResult = await sut.validate(100, 'test')
    expect(validationResult.hasError()).toBe(false)
  })

  test('it fails validation if the la code is not found in the known list', async () => {
    jest.spyOn(laCodeService, 'getLaCodes').mockResolvedValue([100, 202, 999])
    const validationResult = await sut.validate(532, 'test')
    expect(validationResult.hasError()).toBe(true)
  })
})
