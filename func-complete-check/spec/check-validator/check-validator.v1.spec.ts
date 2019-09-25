import * as CheckValidator from '../../check-validator/check-validator.v1'
let sut: CheckValidator.CheckValidatorV1
describe('check-validator/v1', () => {
  beforeEach(() => {
    sut = new CheckValidator.CheckValidatorV1()
  })
  it('should be defined', () => {
    expect(sut).toBeDefined()
  })
})
