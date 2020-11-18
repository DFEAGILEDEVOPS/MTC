import { IEstablishment } from '../IEstablishment'

export interface ISchoolTransformer {
  transform (estab: IEstablishment): IEstablishment
}

export class PredecessorTransformer implements ISchoolTransformer {
  transform (estab: IEstablishment): IEstablishment {
    throw new Error('not implemented')
  }
}

export class SuccessorTransformer implements ISchoolTransformer {
  transform (estab: IEstablishment): IEstablishment {
    throw new Error('not implemented')
  }
}

export class NullTransformer implements ISchoolTransformer {
  transform (estab: IEstablishment): IEstablishment {
    return estab
  }
}
