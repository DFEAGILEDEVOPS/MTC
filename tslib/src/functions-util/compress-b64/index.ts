import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import { CompressionService } from '../../common/compression-service'
import config from '../../config'

const svc = new CompressionService()

app.http('util-compress-b64', {
  methods: ['POST'],
  authLevel: 'function',
  handler: utilCompressBase64
})

export async function utilCompressBase64 (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  if (!config.DevTestUtils.TestSupportApi) {
    context.log('exiting as not enabled (default behaviour)')
    return {
      status: 409,
      body: 'feature unavailable'
    }
  }

  let compressed: string = ''
  let temp: string = ''

  if (request.headers.get('content-type') === 'application/json') {
    temp = JSON.stringify(await request.json())
  } else {
    temp = await request.text()
  }
  if (temp === undefined) {
    return {
      status: 400,
      jsonBody: {
        error: 'missing request body'
      }
    }
  }

  try {
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
