import { app, output, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import { performance } from 'perf_hooks'
import config from '../../config'
import { SchoolApi } from './school-api'
import { UserApi } from './user-api'

const functionName = 'util-test-support-api-create-school'

const outputCheckSubmissionStorageQueue = output.storageQueue({
  connection: 'AZURE_STORAGE_CONNECTION_STRING',
  queueName: 'check-submitted'
})

const outputCheckSubmissionServiceBusQueue = output.serviceBusQueue({
  connection: 'AZURE_SERVICE_BUS_CONNECTION_STRING',
  queueName: 'check-submission'
})

app.http(functionName, {
  methods: ['POST'],
  authLevel: 'function', // TODO this was anonymous in v3 - why? ask QA about usage context
  handler: utilTestSupportApi,
  extraOutputs: [outputCheckSubmissionStorageQueue, outputCheckSubmissionServiceBusQueue]
})

function finish (start: number, context: InvocationContext): void {
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

export async function utilTestSupportApi (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  if (!config.DevTestUtils.TestSupportApi) {
    context.log('exiting as not enabled (default behaviour)')
    return {
      status: 409,
      body: 'feature unavailable'
    }
  }
  // Respond in 230 seconds or the load balancer will time-out
  // https://docs.microsoft.com/en-us/azure/azure-functions/functions-bindings-http-webhook-trigger?tabs=javascript#limits
  const start = performance.now()
  const entity = context.triggerMetadata?.entity

  switch (entity) {
    case 'school':
      if (req.method === 'PUT') {
        const response = await createSchool(context, req)
        return response
      }
      break

    case 'user':
      if (req.method === 'PUT') {
        const response = await createUser(context, req)
        return response
      }
      break

    default:
      return generateResponse(context, 'Failed', 400, 'Bad request')
  }
  finish(start, context)
  return {
    status: 200
  }
}

async function createSchool (context: InvocationContext, req: HttpRequest): Promise<HttpResponseInit> {
  if (req.body === null) {
    return generateResponse(context, 'Failed', 400, 'Missing body')
  }

  try {
    const schoolApi = new SchoolApi(context)
    const entity = await schoolApi.create(req.body)
    return generateResponse(context, 'Success', 201, 'Created', entity)
  } catch (error) {
    let errorMessage = 'unknown error'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    return generateResponse(context, 'Failed', 500, errorMessage)
  }
}

async function createUser (context: InvocationContext, req: HttpRequest): Promise<HttpResponseInit> {
  if (req.body === undefined) {
    return generateResponse(context, 'Failed', 400, 'Missing body')
  }

  try {
    const userApi = new UserApi(context)
    const entity = await userApi.create(req.body)
    return generateResponse(context, 'Success', 201, 'Created', entity)
  } catch (error) {
    let errorMessage = 'unknown error'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    return generateResponse(context, 'Failed', 500, errorMessage)
  }
}

const generateResponse = function (context: InvocationContext, result: 'Success' | 'Failed', statusCode: number, message: string, entity?: object): HttpResponseInit {
  return {
    jsonBody: JSON.stringify({ result, message, entity }),
    status: statusCode,
    headers: {
      'Content-Type': 'application/json'
    }
  }
}
