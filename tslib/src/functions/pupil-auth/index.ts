
import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import { PupilAuthService, IPupilAuthFunctionBindings } from './pupil-auth.service'

const pupilAuthService = new PupilAuthService()

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

  if (req.method === 'OPTIONS') {
    context.res = {
      body: '',
      headers:
      {
        'Access-Control-Allow-Methods' : 'POST,OPTIONS',
        'allow' : 'POST,OPTIONS'
      },
      status: 200
    }
    return
  }

  if (!req.body || !req.body.pupilPin || !req.body.schoolPin) {
    context.res = {
      status: 401
    }
    return
  }
  const pupilPin = req.body.pupilPin
  const schoolPin = req.body.schoolPin
  const check = await pupilAuthService.authenticate(schoolPin, pupilPin, context.bindings as IPupilAuthFunctionBindings)
  if (!check) {
    context.res = {
      status: 401
    }
    return
  } else {
    context.res = {
      status: 200,
      body: check,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  }
}

export default httpTrigger
