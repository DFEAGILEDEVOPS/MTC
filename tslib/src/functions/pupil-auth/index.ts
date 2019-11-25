
import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import { PupilAuthService, IPupilAuthFunctionBindings } from './pupil-auth.service'

const pupilAuthService = new PupilAuthService()

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  if (context.req === undefined) {
    context.res = {
      status: 401
    }
    return
  }
  const response = await pupilAuthService.authenticate(context.bindings as IPupilAuthFunctionBindings, context.req)
  response.isRaw = true
  // response.body = JSON.stringify(response.body)
  context.bindings.res = {
    status: 200,
    body: {
      test: 'test'
    }
  }
  // context.log.info(JSON.stringify(context.res, null, 2))
}

export default httpTrigger
