
export class SchoolPinGenerator implements ISchoolPinGenerator {
  generate (): string {
    return 'abc12def'
  }
}

export interface ISchoolPinGenerator {
  generate (): string
}
