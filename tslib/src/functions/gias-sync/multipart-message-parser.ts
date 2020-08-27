
export class MultipartMessageParser {
  parse (response: IResponse): any {
    return response
  }

  extractBoundaryIdFrom (response: IResponse): string {
    const contentType = response.headers['content-type']
    if (contentType === undefined) {
      throw new Error('content-type header not found on response')
    }
    const contentTypeDetail = contentType.split(';').map(x => x.trim())
    if (contentTypeDetail[0].toLowerCase() !== 'multipart/related') {
      throw new Error('response is not a multipart message')
    }
    return ''
  }
}

export interface IResponseHeader {
  'transfer-encoding'?: string,
  'content-type'?: string,
  'set-cookie'?: Array<string>
  accept?: string,
}

export interface IResponse {
  body: any,
  headers: IResponseHeader,
  statusCode: number
}
