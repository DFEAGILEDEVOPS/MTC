import * as appInsights from 'applicationinsights'
import { AzureFunction, Context } from '@azure/functions'
import { HttpRequest } from 'applicationinsights/out/Library/Functions'
import aiHelper from '../../azure/app-insights'

aiHelper.startInsightsIfConfigured('util-diag')

const httpTrigger: AzureFunction = function (context: Context): void {
  context.res = {
    status: 200,
    body: `func-consumption. Node version: ${process.version}`
  }
  context.done()
}

export default async function contextPropagatingHttpTrigger(context: Context, req: HttpRequest) {
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
          name: context?.req?.method + " " + context?.req?.url,
          resultCode: context?.res?.status,
          success: true,
          url: req.url,
          duration: Date.now() - startTime,
          id: correlationContext?.operation.parentId,
      });
      appInsights.defaultClient.flush();
  }, correlationContext)();
};
