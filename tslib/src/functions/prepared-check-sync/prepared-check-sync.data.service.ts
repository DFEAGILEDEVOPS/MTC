
export interface IPreparedCheckSyncDataService {
  getCurrentChecksByPupilUuid (pupilUUID: string): Promise<Array<string>>
  getAccessArrangementsCodesById (aaIds: Array<number>): Promise<Array<string>>
  getAccessArrangementsByCheckCode (checkCode: string): Promise<any>
}

export class PreparedCheckSyncDataService implements IPreparedCheckSyncDataService {
  getCurrentChecksByPupilUuid (pupilUUID: string): Promise<string[]> {
    throw new Error('Method not implemented.')
  }
  getAccessArrangementsCodesById (aaIds: number[]): Promise<string[]> {
    throw new Error('Method not implemented.')
  }
  getAccessArrangementsByCheckCode (checkCode: string): Promise<any> {
    throw new Error('Method not implemented.')
  }
}
