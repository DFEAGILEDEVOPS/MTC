import { IEstablishmentFilter, MtcEstablishmentFilter } from './establishment-type-age.filter'
import { GiasExtractParser, IGiasExtractParser } from './gias-extract-parser'
import { GiasWebService, IGiasWebService } from './web/gias-web.service'

export class GiasOrchestrator {
  private readonly giasWebService: IGiasWebService
  private readonly extractParser: IGiasExtractParser
  private readonly estabFilter: IEstablishmentFilter

  constructor (giasWebService?: IGiasWebService, extractParser?: IGiasExtractParser, estabFilter?: IEstablishmentFilter) {
    if (giasWebService === undefined) {
      giasWebService = new GiasWebService()
    }
    this.giasWebService = giasWebService
    if (extractParser === undefined) {
      extractParser = new GiasExtractParser()
    }
    this.extractParser = extractParser
    if (estabFilter === undefined) {
      estabFilter = new MtcEstablishmentFilter()
    }
    this.estabFilter = estabFilter
  }

  async execute (): Promise<any> {
    const extract = await this.giasWebService.getExtract(12345)
    const establishments = this.extractParser.parse(extract)
    const filteredSchools = this.estabFilter.byTypeAndAgeRange(establishments)
    return filteredSchools
  }
}
