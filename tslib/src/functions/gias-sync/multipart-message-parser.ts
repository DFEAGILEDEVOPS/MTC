
export interface IMultipartMessageParser {
  parse (response: IResponse): IMessagePart[]
  extractBoundaryIdFrom (response: IResponse): string
}

export class MultipartMessageParser implements IMultipartMessageParser {
  parse (response: IResponse): IMessagePart[] {
    const boundaryId = this.extractBoundaryIdFrom(response)
    const boundary = Buffer.from(`--${boundaryId}`, 'utf8')
    const bufferParts = this.splitDataIndexParts(response.body, boundary)
    const messageParts = new Array<IMessagePart>()
    for (let index = 0; index < bufferParts.length; index++) {
      const part = bufferParts[index]
      if (part !== undefined) {
        const messagePart = this.parsePart(part)
        messageParts.push(messagePart)
      }
    }
    return messageParts
  }

  private parsePart (part: Buffer): IMessagePart {
    const index = this.indexOf(part, Buffer.from('\r\n\r\n'))

    const headerBuffer = Buffer.alloc(index)
    part.copy(headerBuffer, 0, 0, index)
    const headers = headerBuffer.toString('utf8').split('\r\n')

    const body = Buffer.alloc(part.length - index - 4)
    part.copy(body, 0, index + 4, part.length)

    const contentType = this.extractContentTypeFromHeaders(headers) ?? 'application/octet-stream'
    const content = contentType.toLowerCase() === 'application/octet-stream' ? body : body.toString('utf8')
    const id = this.extractContentIdFromHeaders(headers)
    return {
      content: content,
      contentType: contentType,
      id: id
    }
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

  private splitDataIndexParts (data: Buffer, boundary: Buffer): Array<Buffer | undefined> {
    const partBuffers = []
    let prevIndex = -1
    let index = this.indexOf(data, boundary, 0)
    while (index > -1) {
      if (prevIndex > -1) {
        const start = prevIndex + boundary.length + 2
        const length = index - start - 2
        const part = Buffer.alloc(length)
        data.copy(part, 0, start, start + length)
        partBuffers.push(part)
      }
      prevIndex = index
      index = this.indexOf(data, boundary, prevIndex + 1)
    }
    return partBuffers
  }

  private indexOf (value: Buffer, criteria: Buffer, start = 0): number {
    const block = Buffer.alloc(criteria.length)
    let index = start
    let found = false

    while (!found && index + block.length < value.length) {
      value.copy(block, 0, index, index + block.length)
      const x = block.compare(criteria)
      if (x === 0) {
        found = true
      } else {
        index += 1
      }
    }
    return found ? index : -1
  }

  private extractContentTypeFromHeaders (headers: string[]): string | undefined {
    let contentType = headers.find(x => x.toLowerCase().startsWith('content-type:'))
    if (!contentType) {
      return undefined
    }
    contentType = contentType.substr(13).trim()

    const semiIndex = contentType.indexOf(';')
    return semiIndex > -1 ? contentType.substr(0, semiIndex) : contentType
  }

  private extractContentIdFromHeaders (headers: string[]): string | undefined {
    let contentId = headers.find(x => x.toLowerCase().startsWith('content-id:'))
    if (contentId === undefined) {
      return undefined
    }
    contentId = contentId.substr(11).trim()
    if (contentId.endsWith('>')) {
      contentId = contentId.substr(0, contentId.length - 1)
    }
    if (contentId.startsWith('<')) {
      contentId = contentId.substr(1)
    }
    return contentId
  }
}

export interface IMessagePart {
  contentType: string
  content: string | Buffer
  id?: string
}

export interface IResponseHeader {
  'transfer-encoding'?: string
  'content-type'?: string
  'set-cookie'?: string[]
  accept?: string
}

export interface IResponse {
  body: any
  headers: IResponseHeader
  statusCode: number
}
