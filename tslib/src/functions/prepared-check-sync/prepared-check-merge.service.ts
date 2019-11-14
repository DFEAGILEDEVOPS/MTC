import { IPreparedCheckSyncDataService, PreparedCheckSyncDataService } from './prepared-check-sync.data.service'
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
}

export interface IPreparedCheck {
  schoolPin: string
  pupilPin: number
}
