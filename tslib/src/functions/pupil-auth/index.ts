
import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import { PupilAuthenticationService, IPupilAuthFunctionBindings } from './pupil-auth.service'

const pupilAuthService = new PupilAuthenticationService()

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

  if (!req.body || !req.body.pupilPin || !req.body.schoolPin) {
    context.res = {
      status: 401
    }
    return
  }
  const pupilPin = req.body.pupilPin
  const schoolPin = req.body.schoolPin
  const check = pupilAuthService.authenticate(schoolPin, pupilPin, context.bindings as IPupilAuthFunctionBindings)
  if (!check) {
    context.res = {
      status: 401
    }
    return
  } else {
    context.res = {
      status: 200,
      body: check
    }
  }
}

export default httpTrigger
