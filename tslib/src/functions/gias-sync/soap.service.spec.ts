import { SoapService } from './soap.service'

let sut: SoapService

describe('soap.service', () => {
  beforeEach(() => {
    sut = new SoapService()
  })

  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })
})
