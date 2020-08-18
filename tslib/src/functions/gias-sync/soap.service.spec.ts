import { SoapService, ISoapMessageSpecification } from './soap.service'

let sut: SoapService

describe('soap.service', () => {
  beforeEach(() => {
    sut = new SoapService()
  })

  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('returns a valid soap xml message with username and password in security header', () => {
    const messageSpec: ISoapMessageSpecification = {
      action: 'action',
      credentials: {
        username: 'foo',
        password: 'bar'
      },
      messageExpiryMs: 0
    }
    const expectedHeader = `<username=${messageSpec.credentials.username}`
    expect(sut.buildMessage(messageSpec)).toEqual(expectedHeader)
  })
})
