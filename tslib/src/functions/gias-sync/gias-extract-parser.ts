import { IEstablishment } from './IEstablishment'
import { IXmlParser, XmlParser } from './xml-parser'

export interface IGiasExtractParser {
  parse (extractXml: string): IEstablishment[]
}

export class GiasExtractParser {
  private readonly xmlParser: IXmlParser

  constructor (xmlParser?: IXmlParser) {
    if (xmlParser === undefined) {
      xmlParser = new XmlParser()
    }
    this.xmlParser = xmlParser
  }

  parse (extractXml: string): IEstablishment[] {
    const parsed = this.xmlParser.parse(extractXml)
    return parsed.Establishments.Establishment
  }
}
