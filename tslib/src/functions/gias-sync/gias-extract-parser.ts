import { IXmlParser, XmlParser } from './xml-parser'

export class GiasExtractParser {
  private xmlParser: IXmlParser

  constructor (xmlParser?: IXmlParser) {
    if (xmlParser === undefined) {
      xmlParser = new XmlParser()
    }
    this.xmlParser = xmlParser
  }
  parse (extractXml: string): Array<any> {
    const parsed = this.xmlParser.parse(extractXml)
    return parsed.Establishments.Establishment
  }
}
