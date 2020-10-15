export class AttachmentIdParser {
  parse (extractData: any): string {
    if (extractData === undefined) {
      throw new Error('extract data is required')
    }
    let href: string
    try {
      href = extractData.Envelope.Body.GetExtractResponse.Extract.Include.attr.href
    } catch (error) {
      throw new Error('expected extract structure not found')
    }
    return href.substr(4).replace('%40', '@')
  }
}
