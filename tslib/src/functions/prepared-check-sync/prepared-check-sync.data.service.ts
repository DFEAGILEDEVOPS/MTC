
export interface IPreparedCheckSyncDataService {
  getActiveCheckReferencesByPupilUuid (pupilUUID: string): Promise<IActiveCheckReference[]>
  getAccessArrangementsCodesById (aaIds: Array<number>): Promise<Array<string>>
  getAccessArrangementsByCheckCode (checkCode: string): Promise<Array<any>>
}

export class PreparedCheckSyncDataService implements IPreparedCheckSyncDataService {
  getActiveCheckReferencesByPupilUuid (pupilUUID: string): Promise<IActiveCheckReference[]> {
    throw new Error('Method not implemented.')
  }
  getAccessArrangementsCodesById (aaIds: number[]): Promise<string[]> {
    throw new Error('Method not implemented.')
  }
  getAccessArrangementsByCheckCode (checkCode: string): Promise<Array<any>> {
    throw new Error('Method not implemented.')
  }
}

export interface IActiveCheckReference {
  checkCode: string
  schoolPin: string
  pupilPin: string
}
