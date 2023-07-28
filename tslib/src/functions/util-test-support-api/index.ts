import { type AzureFunction, type Context, type HttpRequest } from '@azure/functions'
import { performance } from 'perf_hooks'
import config from '../../config'
import { SchoolApi } from './school-api'
import { UserApi } from './user-api'

const functionName = 'util-test-support-api-create-school'

function finish (start: number, context: Context): void {
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

const httpTriggerFunc: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  if (!config.DevTestUtils.TestSupportApi) {
    context.log('exiting as not enabled (default behaviour)')
    return
  }
  // Respond in 230 seconds or the load balancer will time-out
  // https://docs.microsoft.com/en-us/azure/azure-functions/functions-bindings-http-webhook-trigger?tabs=javascript#limits
  const start = performance.now()
  const entity = context.bindingData.entity

  switch (entity) {
    case 'school':
      if (req.method === 'PUT') {
        await createSchool(context, req)
      }
      break

    case 'user':
      if (req.method === 'PUT') {
        await createUser(context, req)
      }
      break

    default:
      generateResponse(context, 'Failed', 400, 'Bad request')
  }

  finish(start, context)
}

async function createSchool (context: Context, req: HttpRequest): Promise<void> {
  if (req.body === undefined || req.rawBody?.length === 0) {
    generateResponse(context, 'Failed', 400, 'Missing body'); return
  }

  try {
    const schoolApi = new SchoolApi(context.log)
    const entity = await schoolApi.create(req.body)
    generateResponse(context, 'Success', 201, 'Created', entity)
  } catch (error) {
    let errorMessage = 'unknown error'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    generateResponse(context, 'Failed', 500, errorMessage)
  }
}

async function createUser (context: Context, req: HttpRequest): Promise<void> {
  if (req.body === undefined || req.rawBody?.length === 0) {
    generateResponse(context, 'Failed', 400, 'Missing body'); return
  }

  try {
    const userApi = new UserApi(context.log)
    const entity = await userApi.create(req.body)
    generateResponse(context, 'Success', 201, 'Created', entity)
  } catch (error) {
    let errorMessage = 'unknown error'
    if (error instanceof Error) {
      errorMessage = error.message
    }
    generateResponse(context, 'Failed', 500, errorMessage)
  }
}

const generateResponse = function (context: Context, result: 'Success' | 'Failed', statusCode: number, message: string, entity?: object): void {
  const res = {
    body: JSON.stringify({ result, message, entity }),
    headers: {
      Status: statusCode,
      'Content-Type': 'application/json'
    }
  }
  context.res = res
}

export default httpTriggerFunc
