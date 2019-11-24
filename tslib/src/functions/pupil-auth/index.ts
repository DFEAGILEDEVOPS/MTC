
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
  const response = await pupilAuthService.authenticate2(context.bindings as IPupilAuthFunctionBindings, context.req)
  context.res = response
}

export default httpTrigger
