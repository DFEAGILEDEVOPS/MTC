import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import { CompressionService } from '../index'

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  context.log('HTTP trigger function processed a request.')
  const name = (req.query.name || (req.body && req.body.name))

  if (name) {
    const comp = new CompressionService().compress(name)
    context.res = {
      body: `${name} compressed is ${comp}`
    }
  } else {
    context.res = {
      status: 400,
      body: 'Please pass a name on the query string or in the request body'
    }
  }
}

export default httpTrigger
