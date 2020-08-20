import { GiasService } from './gias.service'
import { ISoapMessageBuilder } from './soap-message-builder'
import { v4 as uuid } from 'uuid'

const SoapMessageBuilderMock = jest.fn<ISoapMessageBuilder, any>(() => ({
  buildMessage: jest.fn()
}))
let sut: GiasService
let soapMessageBuilderMock: ISoapMessageBuilder

const extractId = 'extractId'

describe('GiasSyncService', () => {
  beforeEach(() => {
    soapMessageBuilderMock = new SoapMessageBuilderMock()
    sut = new GiasService(soapMessageBuilderMock)
  })

  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('GetExtract:should return an empty object if no results', async () => {
    const extractResult = await sut.GetExtract(extractId)
    expect(extractResult).toBeDefined()
    expect(extractResult.extractId).toEqual(extractId)
  })

  test('GetExtract:should propogate original error details when a fault occurs', async () => {
    const errorInfo = `errorId:${uuid()}`
    try {
      soapMessageBuilderMock.buildMessage = jest.fn(() => { throw new Error(errorInfo) })
      await sut.GetExtract(extractId)
      fail('error should have been thrown')
    } catch (error) {
      expect(error).toBeDefined()
      expect(error.message).toEqual(errorInfo)
    }
  })

  test.todo('GetExtract: soapMessage specification should reflect inputs')
  test.todo('GetExtract: soap response should be converted into an object')

})
