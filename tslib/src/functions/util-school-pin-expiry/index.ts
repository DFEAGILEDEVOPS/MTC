
import { AzureFunction, Context, HttpRequest } from '@azure/functions'

const httpTrigger: AzureFunction = function (context: Context, req: HttpRequest): void {

/*   const timezone = req.query['timezone']
  const utcNowOverride = req.query['utcnow']
  const sampleSize = req.query['samplesize'] */
  context.done()
}

export default httpTrigger
