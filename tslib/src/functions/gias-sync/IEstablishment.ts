export interface IEstablishment {
  URN: number
  EstablishmentName: string
  EstablishmentNumber?: number | INilAttribute
  EstablishmentStatus: ICodeAttribute
  EstablishmentTypeGroup: ICodeAttribute
  LA: ICodeAttribute
  StatutoryHighAge?: number | INilAttribute
  StatutoryLowAge?: number | INilAttribute
  TypeOfEstablishment: ICodeAttribute
  EstablishmentLinkList?: {
    EstablishmentLink: IEstablishmentLink
  }
}

export interface IEstablishmentLink {
  LinkUrn: number
  EstablishedDate: Date
  LinkType: IEstablishmentLinkType
}

export interface IEstablishmentLinkType {
  Code: number
  DisplayName: string
}

export interface ICodeAttribute {
  Code: number
}

export interface INilAttribute {
  attr: {
    nil: true
  }
}
