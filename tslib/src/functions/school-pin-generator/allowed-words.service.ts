import { type IPinConfigProvider, PinConfigProvider } from './pin-config-provider'
import { type ISchoolPinDataService, SchoolPinDataService } from './school-pin-data-service'

export interface IAllowedWordsService {
  getAllowedWords (): Promise<Set<string>>
}

export class AllowedWordsService implements IAllowedWordsService {
  private allowedWordSet: Set<string> = new Set<string>()
  private readonly schoolPinDataService: ISchoolPinDataService
  private readonly pinConfigProvider: IPinConfigProvider

  constructor (pinConfigProvider?: IPinConfigProvider, schoolPinDataService?: ISchoolPinDataService) {
    if (schoolPinDataService === undefined) {
      schoolPinDataService = new SchoolPinDataService()
    }
    this.schoolPinDataService = schoolPinDataService
    if (pinConfigProvider === undefined) {
      pinConfigProvider = new PinConfigProvider()
    }
    this.pinConfigProvider = pinConfigProvider
  }

  private parse (allowedWords: string[], bannedWords: string): Set<string> {
    const bannedWordsArray: string[] = bannedWords.split(',')
    const allowedWordSet = new Set<string>(allowedWords)
    if (allowedWords.length < 5) throw new Error('set of allowed words must be a minimum of 5')
    bannedWordsArray.forEach(word => {
      if (allowedWordSet.has(word)) {
        allowedWordSet.delete(word)
      }
    })
    return allowedWordSet
  }

  async getAllowedWords (): Promise<Set<string>> {
    if (this.allowedWordSet.size === 0) {
      const allowedWords = await this.schoolPinDataService.getAllowedWords()
      const allowedWordSet = this.parse(allowedWords, this.pinConfigProvider.BannedWords)
      this.allowedWordSet = allowedWordSet
    }
    return this.allowedWordSet
  }
}
