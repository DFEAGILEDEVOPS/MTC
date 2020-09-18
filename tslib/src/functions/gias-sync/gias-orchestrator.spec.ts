import { IEstablishmentFilter } from './establishment-type-age.filter'
import { IGiasExtractParser } from './gias-extract-parser'
import { GiasOrchestrator } from './gias-orchestrator'
import { IGiasWebService } from './gias-web.service'
import { IEstablishment } from './IEstablishment'

let sut: GiasOrchestrator
let giasWebServiceMock: IGiasWebService
let extractParserMock: IGiasExtractParser
let establishmentFilter: IEstablishmentFilter

const ExtractParserMock = jest.fn<IGiasExtractParser, any>(() => ({
  parse: jest.fn((extractXml: string) => {
    return []
  })
}))

const GiasWebServiceMock = jest.fn<IGiasWebService, any>(() => ({
  GetExtract: jest.fn()
}))

const EstablishmentFilterMock = jest.fn<IEstablishmentFilter, any>(() => ({
  byTypeAndAgeRange: jest.fn()
}))

describe('gias orchestrator', () => {
  beforeEach(() => {
    giasWebServiceMock = new GiasWebServiceMock()
    extractParserMock = new ExtractParserMock()
    establishmentFilter = new EstablishmentFilterMock()
    sut = new GiasOrchestrator(giasWebServiceMock, extractParserMock, establishmentFilter)
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

  test('establishments are filtered to exclude irrelevant types and age ranges', async () => {
    const establishments = new Array<IEstablishment>()
    extractParserMock.parse = jest.fn((xml: string) => {
      return establishments
    })
    await sut.execute()
    expect(establishmentFilter.byTypeAndAgeRange).toHaveBeenCalledWith(establishments)
  })
})
