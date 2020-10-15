import { IQueueService, SasTokenService } from './sas-token-service'
import moment from 'moment'

const mockQService: IQueueService = {
  getUrl () { return 'url' },
  generateSharedAccessSignature () {
    return 'sas'
  }
}
let sut: SasTokenService

describe('sas token service', () => {
  beforeEach(() => {
    sut = new SasTokenService(mockQService)
  })
  test('should be defined', () => {
    expect(sut).toBeInstanceOf(SasTokenService)
  })
  test('should return url provided by queue service implementation', () => {
    const token = sut.generateSasToken('', moment())
    expect(token.url).toBe('url')
  })
  test('should return token provided by queue service implementation', () => {
    const token = sut.generateSasToken('', moment())
    expect(token.token).toBe('sas')
  })
  test('should throw an error when expiryDate is invalid', () => {
    const invalidMoment = moment('2019-13-41')
    expect(() => sut.generateSasToken('', invalidMoment)).toThrow('Invalid expiryDate')
  })
})
