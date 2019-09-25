import * as CheckValidator from '../../check-validator/check-validator.v1'

describe('check-validator/v1', () => {
  it('should be defined', () => {
    const sut = new CheckValidator.CheckValidatorV1()
    expect(sut).toBeDefined()
  })
})
