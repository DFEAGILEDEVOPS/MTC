export interface IPsReportLogSet {
  ListSchoolsLog: string[]
  PupilDataLog: string[]
  TransformerLog: string[]
  WriterLog: string[]
}

export interface IServiceBusMessageLike {
  body: any
}
