const { PupilHistoryDataService } = require('./data-access/pupil-history.data.service')

export class PupilHistoryService {
  public static async getHistory (pupilUuid) {
    return PupilHistoryDataService.getPupilHistory(pupilUuid)
  }
}
