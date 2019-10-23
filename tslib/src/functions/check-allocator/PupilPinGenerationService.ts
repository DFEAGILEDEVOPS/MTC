export interface IPupilPinGenerationService {
  generate (): number
}

export class PupilPinGenerationService implements IPupilPinGenerationService {
  generate (): number {
    throw new Error('not implemented')
  }
}
