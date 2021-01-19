import * as appInsights from 'applicationinsights'
import { AzureFunction, Context } from '@azure/functions'
import { HttpRequest } from 'applicationinsights/out/Library/Functions'
import { readFile } from 'fs'
import { promisify } from 'util'
import { join } from 'path'
const readFileAsync = promisify(readFile)
let buildNumber: string = ''

const httpTrigger: AzureFunction = async function (context: Context): Promise<void> {
  context.res = {
    status: 200,
    body: `func-consumption. Build:${await getBuildNumber()}. Node version: ${process.version}`
  }
  context.done()
}

export default async function contextPropagatingHttpTrigger (context: Context, req: HttpRequest): Promise<void> {
  // Start an AI Correlation Context using the provided Function context
  const correlationContext = appInsights.startOperation(context, req)

  if (correlationContext === null) {
    return httpTrigger(context, req)
  }

  // Wrap the Function runtime with correlationContext
  return appInsights.wrapWithCorrelationContext(async () => {
    const startTime = Date.now() // Start trackRequest timer

    // Run the Function
    await httpTrigger(context, req)

    // Track Request on completion
    appInsights.defaultClient.trackRequest({
      name: `${context?.req?.method}  ${context?.req?.url}`,
      resultCode: context?.res?.status,
      success: true,
      url: req.url,
      duration: Date.now() - startTime,
      id: correlationContext?.operation.parentId
    })
    appInsights.defaultClient.flush()
  }, correlationContext)()
}

async function getBuildNumber (): Promise<string> {
  if (buildNumber !== '') {
    return buildNumber
  }
  try {
    // expects build.txt to be at the root of the dist folder
    const targetFile = join(__dirname, '..', '..', 'build.txt')
    const result = await readFileAsync(targetFile)
    buildNumber = result.toString()
  } catch {
    buildNumber = 'NOT FOUND'
  }
  return buildNumber
}
