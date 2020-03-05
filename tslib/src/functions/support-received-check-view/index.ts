
import { AzureFunction, Context, HttpRequest } from '@azure/functions'
const functionName = 'support-received-check-view'
import { performance } from 'perf_hooks'

function finish (start: number, context: Context) {
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

const supportReceivedCheckView: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

  const checkCode = req.body.checkCode

  if (!checkCode) {
    context.res = {
      status: 400,
      body: 'checkCode is required'
    }
    return
  }

  const start = performance.now()

  finish(start, context)
}

export default supportReceivedCheckView
