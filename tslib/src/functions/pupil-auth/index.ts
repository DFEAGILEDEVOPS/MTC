
import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import { PupilAuthService, IPupilAuthFunctionBindings } from './pupil-auth.service'

const pupilAuthService = new PupilAuthService()

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  return pupilAuthService.authenticate2(context.bindings as IPupilAuthFunctionBindings, context.req)
}

export default httpTrigger
