
import { AzureFunction, Context, HttpRequest } from '@azure/functions'

const httpTrigger: AzureFunction = function (context: Context, req: HttpRequest): void {

  context.res = {
    status: 200,
    body: `func-consumption. Node version: ${process.version}`
  }
  context.done()
}

export default httpTrigger
