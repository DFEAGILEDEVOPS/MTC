import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import { CompressionService } from '../../index'

// example function, to be removed when discovery of tslib deployemnt as function apps complete

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  context.log('HTTP trigger function processed a request.')
  const name = (req.query.name)

  if (name) {
    const comp = new CompressionService().compress(name)
    context.res = {
      body: `${name} compressed is ${comp}`
    }
  } else {
    context.res = {
      status: 400,
      body: 'Please pass a name as query string'
    }
  }
}

export default httpTrigger
