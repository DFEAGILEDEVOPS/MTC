import { app, output, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import { performance } from 'perf_hooks'
import config from '../../config'
import { type ICreateUserModel, UserApi } from '../create-user/user-api'

const functionName = 'util-create-user'

const outputCheckSubmissionServiceBusQueue = output.serviceBusQueue({
  connection: 'AZURE_SERVICE_BUS_CONNECTION_STRING',
  queueName: 'check-submission'
})

app.http(functionName, {
  methods: ['PUT'],
  authLevel: 'function', // TODO this was anonymous in v3 - why? ask QA about usage context
  handler: utilCreateUser,
  extraOutputs: [outputCheckSubmissionServiceBusQueue]
})

function finish (start: number, context: InvocationContext): void {
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

export async function utilCreateUser (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  if (!config.DevTestUtils.TestSupportApi) {
    context.log('exiting as not enabled (default behaviour)')
    return {
      status: 409,
      body: 'feature unavailable'
    }
  }

  if (req.method !== 'PUT') {
    return generateResponse(context, 'Failed', 400, 'Bad request')
  }

  const start = performance.now()
  const response = await createUser(context, req)
  finish(start, context)
  return response
}

async function createUser (context: InvocationContext, req: HttpRequest): Promise<HttpResponseInit> {
  if (req.body === undefined) {
    return generateResponse(context, 'Failed', 400, 'Missing body')
  }

  try {
    const userApi = new UserApi(context)
    const newUserInfo = await req.json() as ICreateUserModel
    const entity = await userApi.create(newUserInfo)
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
    jsonBody: { result, message, entity },
    status: statusCode,
    headers: {
      'Content-Type': 'application/json'
    }
  }
}
