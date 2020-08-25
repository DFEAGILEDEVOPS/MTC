import * as xmlParser from 'fast-xml-parser'
import * as he from 'he'

const xmlParserOptions = {
  attributeNamePrefix : '',
  attrNodeName: 'attr', // default is 'false'
  textNodeName : 'value',
  ignoreAttributes : false,
  ignoreNameSpace : true,
  allowBooleanAttributes : false,
  parseNodeValue : true,
  parseAttributeValue : false,
  trimValues: true,
  cdataTagName: '__cdata', // default is 'false'
  cdataPositionChar: '\\c',
  parseTrueNumberOnly: false,
  arrayMode: false, // "strict"
  attrValueProcessor: (val: any, attrName: string) => he.decode(val, { isAttributeValue: true }),// default is a=>a
  tagValueProcessor : (val: any, tagName: string) => he.decode(val), // default is a=>a
  stopNodes: ['parse-me-as-string']
}

export class XmlParser implements IXmlParser {
  parse (xml: string): any {
    return xmlParser.parse(xml, xmlParserOptions)
  }
}

export interface IXmlParser {
  parse (xml: string): any
}
