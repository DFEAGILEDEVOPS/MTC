
export interface ISchoolRecord {
  urn: number
  name: string
  leaCode: number
  estabCode: number
  estabTypeGroupCode: EstabTypeGroupCode
  estabTypeCode: EstabTypeCode
  estabStatusCode: number
  statLowAge?: number
  statHighAge?: number
}

export enum EstabStatusCode {
  Open = 1,
  Closed = 2,
  ProposedToClose = 3,
  ProposedToOpen = 4
}

export enum EstabTypeGroupCode {
  college = 1,
  university = 2,
  independent = 3,
  localAuthorityMaintainedSchool = 4,
  specialSchool = 5,
  welshSchool = 6,
  otherTypes = 9,
  academies = 10,
  freeSchool = 11,
  childrensCentre = 12
}

export enum EstabTypeCode {
  communitySpecialSchool = 7,
  foundationSpecialSchool = 12,
  serviceChildrensEducation = 26,
  offshore = 25
}
