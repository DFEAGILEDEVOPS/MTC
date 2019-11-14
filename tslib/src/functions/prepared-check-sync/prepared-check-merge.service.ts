import { IPreparedCheckSyncDataService, PreparedCheckSyncDataService } from './prepared-check-sync.data.service'
import { Context } from '@azure/functions'
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
  async merge (preparedCheck: any): Promise<IPreparedCheck> {
    await this.dataService.getAccessArrangementsByCheckCode('x')
    throw new Error('not implemented')
  }

  async updateAccessArrangements (existingCheckConfig: any, pupilAccessArrangements: any, context: Context) {
    const newCheckConfig = JSON.parse(existingCheckConfig)
    if (newCheckConfig.colourContrastCode) {
      delete newCheckConfig.colourContrastCode
    }
    if (newCheckConfig.fontSizeCode) {
      delete newCheckConfig.fontSizeCode
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
    if (!pupilAccessArrangements || pupilAccessArrangements.length === 0) {
      return R.merge(newCheckConfig, aaConfig)
    }
    const fontSizeAccessArrangement = pupilAccessArrangements.find((aa: any) => aa.pupilFontSizeCode)
    const colourContrastAccessArrangement = pupilAccessArrangements.find((aa: any) => aa.pupilColourContrastCode)
    const accessArrangementsIds = pupilAccessArrangements.map((aa: any) => aa.accessArrangements_id)
    let pupilAccessArrangementsCodes
    try {
      pupilAccessArrangementsCodes = await this.dataService.getAccessArrangementsCodesById(accessArrangementsIds)
    } catch (error) {
      context.log.error(`prepared-check-sync: ERROR: unable to fetch pupil access arrangements codes for accessArrangementsIds ${accessArrangementsIds}`)
      throw error
    }
    pupilAccessArrangementsCodes.forEach(code => {
      if (code === AccessArrangementCodes.AUDIBLE_SOUNDS) aaConfig.audibleSounds = true
      if (code === AccessArrangementCodes.INPUT_ASSISTANCE) aaConfig.inputAssistance = true
      if (code === AccessArrangementCodes.NUMPAD_REMOVAL) aaConfig.numpadRemoval = true
      if (code === AccessArrangementCodes.FONT_SIZE) {
        aaConfig.fontSize = true
      }
      if (fontSizeAccessArrangement && fontSizeAccessArrangement.pupilFontSizeCode) {
        aaConfig.fontSizeCode = fontSizeAccessArrangement.pupilFontSizeCode
      }
      if (code === AccessArrangementCodes.COLOUR_CONTRAST) {
        aaConfig.colourContrast = true
      }
      if (colourContrastAccessArrangement && colourContrastAccessArrangement.pupilColourContrastCode) {
        aaConfig.colourContrastCode = colourContrastAccessArrangement.pupilColourContrastCode
      }
      if (code === AccessArrangementCodes.QUESTION_READER) aaConfig.questionReader = true
      if (code === AccessArrangementCodes.NEXT_BETWEEN_QUESTIONS) aaConfig.nextBetweenQuestions = true
    })
    return R.merge(newCheckConfig, aaConfig)
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
}
