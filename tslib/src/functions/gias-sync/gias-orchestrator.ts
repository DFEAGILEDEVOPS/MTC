import { ConsoleLogger, ILogger } from '../../common/logger'
import { GiasExtractParser, IGiasExtractParser } from './gias-extract-parser'
import { GiasWebService, IGiasWebService } from './gias-web.service'
import { IEstablishment } from './IEstablishment'
import predicates from './school-predicates'

export class GiasOrchestrator {

  private giasWebService: IGiasWebService
  private extractParser: IGiasExtractParser
  private logger: ILogger

  constructor(giasWebService?: IGiasWebService, extractParser?: IGiasExtractParser, logger?: ILogger) {
    if (giasWebService === undefined) {
      giasWebService = new GiasWebService()
    }
    this.giasWebService = giasWebService
    if (extractParser === undefined) {
      extractParser = new GiasExtractParser()
    }
    this.extractParser = extractParser
    if (logger === undefined) {
      logger = new ConsoleLogger()
    }
    this.logger = logger
  }

  async execute (): Promise<Array<IEstablishment>> {
    const extract = await this.giasWebService.GetExtract(12345)
    const establishments = this.extractParser.parse(extract)
    const filteredSchools = new Array<IEstablishment>()
    establishments.forEach(school => {
      if (this.isCorrectTypeAndAgeRange(school, this.logger)) {
        filteredSchools.push(school)
      }
    })
    return filteredSchools
  }

  private isCorrectTypeAndAgeRange (school: IEstablishment, logger: ILogger): boolean {
    const targetAge = 9
    return predicates.isSchoolOpen(logger, school) &&
      predicates.isRequiredEstablishmentTypeGroup(logger, school) &&
      predicates.isAgeInRange(logger, targetAge, school)
  }
}
