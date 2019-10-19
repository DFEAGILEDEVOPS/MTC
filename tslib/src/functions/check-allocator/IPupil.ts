export interface IPupil {
  id: number;
}
export interface IPupilAllocation {
  id: number;
  pin?: number;
  allocatedForm?: any;
  allocatedAtUtc: Date;
}
export interface ISchoolAllocation {
  schoolUUID: string;
  pupils: Array<IPupil>;
  lastReplenishmentUtc: Date;
}
