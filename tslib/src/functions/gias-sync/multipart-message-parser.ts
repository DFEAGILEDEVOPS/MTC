
export class MultipartMessageParser {
  parse (response: IResponse): any {
    const boundaryId = this.extractBoundaryIdFrom(response)
    return boundaryId
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
    const boundaryInfo = contentTypeDetail.find(x => x.toLowerCase().startsWith('boundary='))
    if (boundaryInfo === undefined) {
      throw new Error('boundary id not defined')
    }
    return boundaryInfo.substr(0, boundaryInfo.length - 1).substr(10)
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
