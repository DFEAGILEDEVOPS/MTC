import { AzureFunction, Context, HttpRequest } from '@azure/functions'
// import moment from 'moment'
import { performance } from 'perf_hooks'
import config from '../../config'
import { SchoolApi } from './school-api'

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
    context.done()
    return
  }
  // Respond in 230 seconds or the load balancer will time-out
  // https://docs.microsoft.com/en-us/azure/azure-functions/functions-bindings-http-webhook-trigger?tabs=javascript#limits
  const start = performance.now()

  if (req.method !== 'PUT') {
    return generateResponse(context, 'Failed', 405, 'Method not allowed')
  }

  if (req.body === undefined || req.rawBody?.length === 0) {
    return generateResponse(context, 'Failed', 400, 'Missing body')
  }

  try {
    const schoolApi = new SchoolApi(context.log)
    const entity = await schoolApi.create(req.body)
    generateResponse(context, 'Success', 201, 'Created', entity)
  } catch (error) {
    return generateResponse(context, 'Failed', 500, error.message)
  }

  finish(start, context)
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
