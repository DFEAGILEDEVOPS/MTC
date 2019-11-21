import * as R from 'ramda'
import moment = require('moment')
import { SqlService } from '../../sql/sql.service'

export interface IPreparedCheckMergeDataService {
  getAccessArrangementsCodesByIds (aaIds: Array<number>): Promise<Array<string>>
}

interface IAccessArrangementCode {
  id: number
  code: string
}

export class PreparedCheckMergeDataService implements IPreparedCheckMergeDataService {
  private static aaCodes = new Array<IAccessArrangementCode>()
  private sqlService: SqlService

  constructor() {
    this.sqlService = new SqlService()
  }
  async getAccessArrangementsCodesByIds (aaIds: Array<number>): Promise<string[]> {
    if (PreparedCheckMergeDataService.aaCodes.length === 0) {
      await this.initCodes()
    }
    return Object.keys(PreparedCheckMergeDataService.aaCodes).filter((code: any) =>
      PreparedCheckMergeDataService.aaCodes[code] && aaIds.includes(PreparedCheckMergeDataService.aaCodes[code].id)
    )
  }

  private async initCodes (): Promise<void> {
    const sql = 'SELECT id, code FROM [mtc_admin].[accessArrangements]'
    const codes = await this.sqlService.query(sql)
    codes.map((aa: any) => {
      PreparedCheckMergeDataService.aaCodes[aa.code] = { id: aa.id, code: aa.code }
    })
  }
}

export interface IPreparedCheckMergeService {
  merge (preparedCheck: any, newAaConfig: any): Promise<ICheckConfig>
}
export class PreparedCheckMergeService implements IPreparedCheckMergeService {

  private dataService: IPreparedCheckMergeDataService
  constructor(dataService?: IPreparedCheckMergeDataService) {
    if (dataService === undefined) {
      dataService = new PreparedCheckMergeDataService()
    }
    this.dataService = dataService
  }
  async merge (oldConfig: ICheckConfig, newConfig: any): Promise<ICheckConfig> {
    if (oldConfig.colourContrastCode) {
      delete oldConfig.colourContrastCode
    }
    if (oldConfig.fontSizeCode) {
      delete oldConfig.fontSizeCode
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
    if (!newConfig || newConfig.length === 0) {
      return R.merge(oldConfig, aaConfig)
    }
    const fontSizeAa = newConfig.find((aa: any) => aa.pupilFontSizeCode)
    const colourContrastAa = newConfig.find((aa: any) => aa.pupilColourContrastCode)
    const newAaIds = newConfig.map((aa: any) => aa.accessArrangements_id)
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
    return R.merge(oldConfig, aaConfig)
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
  checkCode: string
  config: ICheckConfig
  createdAt: moment.Moment
  pinExpiresAt: moment.Moment
  pupil: {
    firstName: string,
    lastName: string,
    dob: string,
    checkCode: string
  }
  pupilId: number
  questions: Array<ICheckQuestion>
  school: {
    id: number,
    name: string,
    uuid: string
  }
  schoolId: number
  tokens: {
    checkStarted: {
      token: string
      url: string
    },
    pupilPreferences: {
      token: string
      url: string
    },
    pupilFeedback: {
      token: string
      url: string
    },
    jwt: {
      token: string
    }
  },
  updatedAt: moment.Moment
}

export interface ICheckQuestion {
  order: number
  factor1: number
  factor2: number
}

export interface ICheckConfig {
  audibleSounds: boolean
  checkTime?: number
  colourContrast: boolean
  colourContrastCode?: string
  compressCompletedCheck?: boolean
  fontSize: boolean
  fontSizeCode?: string
  inputAssistance: boolean
  loadingTime: number
  nextBetweenQuestions: boolean
  numpadRemoval: boolean
  practice: boolean
  questionReader: boolean
  questionTime: number
  speechSynthesis?: boolean
}
