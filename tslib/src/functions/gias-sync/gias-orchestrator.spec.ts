import { IGiasExtractParser } from './gias-extract-parser'
import { GiasOrchestrator } from './gias-orchestrator'
import { IGiasWebService } from './gias-web.service'

let sut: GiasOrchestrator
let giasWebServiceMock: IGiasWebService
let extractParserMock: IGiasExtractParser

const ExtractParserMock = jest.fn<IGiasExtractParser, any>(() => ({
  parse: jest.fn((extractXml: string) => {
    return []
  })
}))

const GiasWebServiceMock = jest.fn<IGiasWebService, any>(() => ({
  GetExtract: jest.fn()
}))

describe('gias orchestrator', () => {
  beforeEach(() => {
    giasWebServiceMock = new GiasWebServiceMock()
    extractParserMock = new ExtractParserMock()
    sut = new GiasOrchestrator(giasWebServiceMock, extractParserMock)
  })

  test('subject should be defined', () => {
    expect(sut).toBeDefined()
  })

  test('parses xml extract into array of establishments', async () => {
    const extractXml = '<xml />'
    giasWebServiceMock.GetExtract = jest.fn((extractId) => {
      return Promise.resolve(extractXml)
    })
    await sut.execute()
    expect(giasWebServiceMock.GetExtract).toHaveBeenCalledTimes(1)
    expect(extractParserMock.parse).toHaveBeenCalledWith(extractXml)
  })
})
