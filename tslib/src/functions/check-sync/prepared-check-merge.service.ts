import { IPreparedCheckSyncDataService, PreparedCheckSyncDataService } from './prepared-check-sync.data.service'
import * as R from 'ramda'

export interface IPreparedCheckMergeService {
  merge (preparedCheck: any): Promise<IPreparedCheck>
}
export class PreparedCheckMergeService implements IPreparedCheckMergeService {
  private dataService: IPreparedCheckSyncDataService
  constructor (dataService?: IPreparedCheckSyncDataService) {
    if (dataService === undefined) {
      dataService = new PreparedCheckSyncDataService()
    }
    this.dataService = dataService
  }
  async merge (preparedCheck: IPreparedCheck): Promise<IPreparedCheck> {
    const newAaConfig = await this.dataService.getAccessArrangementsByCheckCode(preparedCheck.checkCode)
    if (newAaConfig.length === 0) {
      throw new Error(`no access arrangements found by checkCode:${preparedCheck.checkCode}`)
    }
    return this.updateAccessArrangements(preparedCheck, newAaConfig)
  }

  private async updateAccessArrangements (preparedCheck: IPreparedCheck, newAccessArrangements: any) {
    if (preparedCheck.colourContrastCode) {
      delete preparedCheck.colourContrastCode
    }
    if (preparedCheck.fontSizeCode) {
      delete preparedCheck.fontSizeCode
    }
    const aaConfig = {
      audibleSounds: false,
      inputAssistance: false,
      numpadRemoval: false,
      fontSize: false,
      colourContrast: false,
      questionReader: false,
      nextBetweenQuestions: false,
      fontSizeCode: undefined,
      colourContrastCode: undefined
    }
    if (!newAccessArrangements || newAccessArrangements.length === 0) {
      return R.merge(preparedCheck, aaConfig)
    }
    const fontSizeAa = newAccessArrangements.find((aa: any) => aa.pupilFontSizeCode)
    const colourContrastAa = newAccessArrangements.find((aa: any) => aa.pupilColourContrastCode)
    const newAaIds = newAccessArrangements.map((aa: any) => aa.accessArrangements_id)
    let aaCodes
    try {
      aaCodes = await this.dataService.getAccessArrangementsCodesByIds(newAaIds)
    } catch (error) {
      throw error
    }
    if (aaCodes.length === 0) {
      throw new Error('no access arrangement codes found')
    }
    aaCodes.forEach(code => {
      if (code === AccessArrangementCodes.AUDIBLE_SOUNDS) aaConfig.audibleSounds = true
      if (code === AccessArrangementCodes.INPUT_ASSISTANCE) aaConfig.inputAssistance = true
      if (code === AccessArrangementCodes.NUMPAD_REMOVAL) aaConfig.numpadRemoval = true
      if (code === AccessArrangementCodes.FONT_SIZE) {
        aaConfig.fontSize = true
      }
      if (fontSizeAa && fontSizeAa.pupilFontSizeCode) {
        aaConfig.fontSizeCode = fontSizeAa.pupilFontSizeCode
      }
      if (code === AccessArrangementCodes.COLOUR_CONTRAST) {
        aaConfig.colourContrast = true
      }
      if (colourContrastAa && colourContrastAa.pupilColourContrastCode) {
        aaConfig.colourContrastCode = colourContrastAa.pupilColourContrastCode
      }
      if (code === AccessArrangementCodes.QUESTION_READER) aaConfig.questionReader = true
      if (code === AccessArrangementCodes.NEXT_BETWEEN_QUESTIONS) aaConfig.nextBetweenQuestions = true
    })
    return R.merge(preparedCheck, aaConfig)
  }
}

export enum AccessArrangementCodes {
  AUDIBLE_SOUNDS = 'ATA',
  COLOUR_CONTRAST = 'CCT',
  FONT_SIZE = 'FTS',
  INPUT_ASSISTANCE = 'ITA',
  NEXT_BETWEEN_QUESTIONS = 'NBQ',
  QUESTION_READER = 'QNR',
  NUMPAD_REMOVAL = 'RON'
}

export interface IPreparedCheck {
  schoolPin: string
  pupilPin: number
  checkCode: string
  colourContrastCode?: string
  fontSizeCode?: string
  questionTime: number
  loadingTime: number
  audibleSounds: boolean
  inputAssistance: boolean
  numpadRemoval: boolean
  fontSize: boolean
  colourContrast: boolean
  questionReader: boolean
  speechSynthesis: boolean
}
