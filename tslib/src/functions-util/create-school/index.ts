import { app, output, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import { performance } from 'perf_hooks'
import config from '../../config'
import { type INewSchoolModel, SchoolApi } from '../create-school/school-api'

const functionName = 'util-create-school'

const outputCheckSubmissionStorageQueue = output.storageQueue({
  connection: 'AZURE_STORAGE_CONNECTION_STRING',
  queueName: 'check-submitted'
})

const outputCheckSubmissionServiceBusQueue = output.serviceBusQueue({
  connection: 'AZURE_SERVICE_BUS_CONNECTION_STRING',
  queueName: 'check-submission'
})

app.http(functionName, {
  methods: ['PUT'],
  authLevel: 'function', // TODO this was anonymous in v3 - why? ask QA about usage context
  handler: utilCreateSchool,
  extraOutputs: [outputCheckSubmissionStorageQueue, outputCheckSubmissionServiceBusQueue]
})

function finish (start: number, context: InvocationContext): void {
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

export async function utilCreateSchool (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
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
  const response = await createSchool(context, req)
  finish(start, context)
  return response
}

async function createSchool (context: InvocationContext, req: HttpRequest): Promise<HttpResponseInit> {
  if (req.body === null) {
    return generateResponse(context, 'Failed', 400, 'Missing body')
  }

  try {
    const schoolApi = new SchoolApi(context)
    const newSchoolInfo = await req.json() as INewSchoolModel
    const entity = await schoolApi.create(newSchoolInfo)
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
