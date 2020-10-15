import { IEstablishmentLink } from '../IEstablishment'
import { EstablishmentLinkType } from './EstablishmentLinkType'
import { ISchoolTransformer, NullTransformer, PredecessorTransformer, SuccessorTransformer } from './school-transformer'

export class SchoolTransformResolver {
  private nullTransformer: NullTransformer
  private predecessorTransformer: PredecessorTransformer
  private successorTransformer: SuccessorTransformer

  constructor () {
    this.nullTransformer = new NullTransformer()
    this.predecessorTransformer = new PredecessorTransformer()
    this.successorTransformer = new SuccessorTransformer()
  }

  resolve (estabLink?: IEstablishmentLink): ISchoolTransformer {
    if (estabLink === undefined) return this.nullTransformer
    switch (estabLink.LinkType.Code) {
      case undefined:
        return this.nullTransformer
      case EstablishmentLinkType.Predecessor:
        return this.predecessorTransformer
      case EstablishmentLinkType.Successor:
        return this.successorTransformer
      default:
        throw new Error(`unknown link type:${estabLink.LinkType.Code}:${estabLink.LinkType.DisplayName}`)
    }
  }
}
