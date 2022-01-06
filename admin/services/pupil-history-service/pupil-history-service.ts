import { ICheckData, IPupilData, IRestartData, ISchoolData } from "./data-access/pupil-history.data.service"

const { PupilHistoryDataService } = require('./data-access/pupil-history.data.service')

export interface IPupilHistory {
  school: ISchoolData,
  pupil: IPupilData,
  checks: ICheckData[],
  restarts: IRestartData[]
  meta: {
    restartTakenCount: number
  }
}

export class PupilHistoryService {
  public static async getHistory (pupilUuid) {
    const rawPupilHistory  = await PupilHistoryDataService.getPupilHistory(pupilUuid)
    const pupilHistory = {
      school: rawPupilHistory.school,
      restarts: rawPupilHistory.restarts,
      pupil: rawPupilHistory.pupil,
      checks: rawPupilHistory.checks,
      meta: {
        restartsTakenCount: rawPupilHistory.restarts.length
      }
    }
    return pupilHistory
  }
}
