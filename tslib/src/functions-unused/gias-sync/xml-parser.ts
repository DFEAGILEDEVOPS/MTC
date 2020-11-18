import * as xmlParser from 'fast-xml-parser'

const xmlParserOptions = {
  attributeNamePrefix: '',
  attrNodeName: 'attr', // default is 'false'
  textNodeName: 'value',
  ignoreAttributes: false,
  ignoreNameSpace: true,
  allowBooleanAttributes: false,
  parseNodeValue: true,
  parseAttributeValue: false,
  trimValues: true,
  cdataTagName: '__cdata', // default is 'false'
  cdataPositionChar: '\\c',
  parseTrueNumberOnly: false,
  arrayMode: false, // "strict"
  attrValueProcessor: (a: any) => a,
  tagValueProcessor: (t: any) => t,
  stopNodes: []
}

export class XmlParser implements IXmlParser {
  parse (xml: string): any {
    return xmlParser.parse(xml, xmlParserOptions)
  }
}

export interface IXmlParser {
  parse (xml: string): any
}
