
const extractContentTypeFromHeaders = (headers: Array<string>) => {
  let contentType = headers.find(x => x.toLowerCase().startsWith('content-type:'))
  if (!contentType) {
    return undefined
  }
  contentType = contentType.substr(13).trim()

  const semiIndex = contentType.indexOf(';')
  return semiIndex > -1 ? contentType.substr(0, semiIndex) : contentType
}

const extractContentIdFromHeaders = (headers: Array<string>): string | undefined => {
  let contentId = headers.find(x => x.toLowerCase().startsWith('content-id:'))
  if (!contentId) {
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

const indexOf = (value: Buffer, criteria: Buffer, start = 0) => {
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
const splitDataIndexParts = (data: Buffer, boundary: Buffer) => {
  const partBuffers = []
  let prevIndex = -1
  let index = indexOf(data, boundary, 0)
  while (index > -1) {
    if (prevIndex > -1) {
      const start = prevIndex + boundary.length + 2
      const length = index - start - 2
      const part = Buffer.alloc(length)
      data.copy(part, 0, start, start + length)
      partBuffers.push(part)
    }
    prevIndex = index
    index = indexOf(data, boundary, prevIndex + 1)
  }
  return partBuffers
}

export class MultipartMessagePart {
  private _contentType: string
  private _content: string | Buffer
  private _id?: string

  constructor (contentType: string, content: string | Buffer, id?: string) {
    this._contentType = contentType
    this._content = content
    this._id = id
  }

  get contentType () {
    return this._contentType
  }

  get content () {
    return this._content
  }

  get id () {
    return this._id
  }

  static parse (part: Buffer) {
    const index = indexOf(part, Buffer.from('\r\n\r\n'))

    const headerBuffer = Buffer.alloc(index)
    part.copy(headerBuffer, 0, 0, index)
    const headers = headerBuffer.toString('utf8').split('\r\n')

    const body = Buffer.alloc(part.length - index - 4)
    part.copy(body, 0, index + 4, part.length)

    const contentType = extractContentTypeFromHeaders(headers) || 'application/octet-stream'
    const content = contentType.toLowerCase() === 'application/octet-stream' ? body : body.toString('utf8')
    const id = extractContentIdFromHeaders(headers)

    return new MultipartMessagePart(contentType, content, id)
  }
}

export class MultipartMessage {
  private _parts?: Array<MultipartMessagePart>

  constructor (parts?: Array<MultipartMessagePart>) {
    this._parts = parts
  }

  get parts () {
    return this._parts
  }

  static getBoundaryIdFromResponse (response: any) {
    const contentType: string = response.headers['content-type']
    const details = contentType.split(';').map(x => x.trim())
    if (details[0].toLowerCase() !== 'multipart/related') {
      throw new Error('Not multipart/related')
    }
    const boundaryDetails = details.find(x => x.toLowerCase().startsWith('boundary='))
    if (boundaryDetails === undefined) {
      throw new Error('boundary not found')
    }
    return boundaryDetails.substr(0, boundaryDetails.length - 1).substr(10)
  }

  static parse (value: Buffer, boundaryId: string) {
    const boundary = Buffer.from(`--${boundaryId}`, 'utf8')
    const partBuffers = splitDataIndexParts(value, boundary)
    return new MultipartMessage(partBuffers.map(MultipartMessagePart.parse))
  }
}
