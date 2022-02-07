import { IPupilHistoryCheckData, IPupilHistoryPupilData, IPupilHistoryRestartData, IPupilHistorySchoolData } from "./data-access/pupil-history.data.service"
import * as R from 'ramda'
const { PupilHistoryDataService } = require('./data-access/pupil-history.data.service')

export interface IPupilHistory {
  school: IPupilHistorySchoolData,
  pupil: IPupilHistoryPupilData,
  checks: IPupilHistoryCheckData[],
  restarts: IPupilHistoryRestartData[]
  meta: {
    restartTakenCount: number
  }
}

export type TCheckStatus = 'Pin generated' | 'Logged in' | 'Check received' | 'Received data error' | 'Check complete' | 'n/a'
export class PupilHistoryService {
  private static getCheckStatus (check: IPupilHistoryCheckData): TCheckStatus {

    if (check.complete === true) {
      return 'Check complete'
    } else if (check.processingFailed === true) {
      return 'Received data error'
    } else if (check.complete === false && check.pupilLoginDate !== null && check.received === false && check.processingFailed === false) {
      return 'Logged in'
    } else if (check.complete === false && check.pupilLoginDate !== null && check.received === true && check.processingFailed === false) {
      return 'Check received'
    } else if (check.complete === false && check.pupilLoginDate === null && check.received === false && check.processingFailed === false) {
      return 'Pin generated'
    }

    return 'n/a'
  }

  public static async getHistory (pupilUuid) {
    const rawPupilHistory  = await PupilHistoryDataService.getPupilHistory(pupilUuid)

    // Add a check status to each check
    const transformedChecks = rawPupilHistory.checks.map(check => {
      const status = PupilHistoryService.getCheckStatus(check)
      const transCheck = R.assoc('checkStatus', status, check)
      return transCheck
    })

    const pupilHistory = {
      school: rawPupilHistory.school,
      restarts: rawPupilHistory.restarts,
      pupil: rawPupilHistory.pupil,
      checks: transformedChecks,
      meta: {
        restartsTakenCount: rawPupilHistory.restarts.length
      }
    }
    return pupilHistory
  }
}
