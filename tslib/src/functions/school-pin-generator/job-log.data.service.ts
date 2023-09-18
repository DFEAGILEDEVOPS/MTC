export interface ISchoolPinJobLogDataService {
  createJobLog (logData: string): Promise<void>
}
