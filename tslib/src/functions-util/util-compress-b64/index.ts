import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import { CompressionService } from '../../common/compression-service'
import config from '../../config'

const svc = new CompressionService()

app.http('httpRequestTrigger', {
  methods: ['POST'],
  authLevel: 'function',
  handler: httpRequestTrigger
})

export async function httpRequestTrigger (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  if (!config.DevTestUtils.TestSupportApi) {
    context.log('exiting as not enabled (default behaviour)')
    return {
      status: 409,
      body: 'feature unavailable'
    }
  }
  const reqBody = request.body // TODO read stream
  if (reqBody === undefined) {
    return {
      status: 400,
      jsonBody: {
        error: 'missing request body'
      }
    }
  }
  let compressed: string = ''
  let temp: string = ''
  try {
    if (request.headers.get('content-type') === 'application/json') {
      temp = JSON.stringify(reqBody)
    }
    compressed = svc.compressToBase64(temp)
  } catch (error) {
    let msg = 'unknown error'
    if (error instanceof Error) {
      msg = error.message
    }
    return {
      jsonBody: {
        error: msg
      },
      status: 500
    }
  }

  return {
    jsonBody: {
      compressed
    }
  }
}
