import { IPreparedCheckSyncDataService, PreparedCheckSyncDataService } from './prepared-check-sync.data.service'
import { IPreparedCheckMergeService, PreparedCheckMergeService } from './prepared-check-merge.service'

export class PreparedCheckSyncService {
  private dataService: IPreparedCheckSyncDataService
  private mergeService: IPreparedCheckMergeService
  constructor(dataService?: IPreparedCheckSyncDataService, mergeService?: IPreparedCheckMergeService) {
    if (dataService === undefined) {
      dataService = new PreparedCheckSyncDataService()
    }
    this.dataService = dataService
    if (mergeService === undefined) {
      mergeService = new PreparedCheckMergeService(this.dataService)
    }
    this.mergeService = mergeService
  }
  async process (pupilUUID: string): Promise<void> {
    const checksToUpdate = await this.dataService.getCurrentChecksByPupilUuid(pupilUUID)
    if (checksToUpdate.length === 0) {
      throw new Error(`no checks found for pupil UUID:${pupilUUID}`)
    }
    for (let index = 0; index < checksToUpdate.length; index++) {
      const check = checksToUpdate[index]
      await this.mergeService.merge(check)
    }
  }
}

export interface IPreparedCheckSyncMessage {
  version: number
  pupilUUID: string
}
