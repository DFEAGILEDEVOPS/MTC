import { app, output, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import { CompressionService } from '../../common/compression-service'

const svc = new CompressionService()

const responseOutput = output.http({
  name: 'httpResponse',
  bindings: {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  }
})

app.http('httpRequestTrigger', {
  methods: ['POST'],
  authLevel: 'function',
  handler: httpRequestTrigger,
  extraOutputs: [responseOutput]
})

export async function httpRequestTrigger (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  const reqBody = request.body // TODO read stream
  if (reqBody === undefined) {
    return {
      status: 400,
      body: 'input is required'
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
    context.extraOutputs.set(responseOutput, {
      body: {
        error: msg
      },
      status: 500
    })
    return 
  }

  context.extraOutputs.set(responseOutput, {
    body: {
      compressed
    }
  })
}
