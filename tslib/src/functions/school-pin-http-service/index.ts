
import { AzureFunction, Context, HttpRequest } from '@azure/functions'

const schoolPinHttpService: AzureFunction = function (context: Context, req: HttpRequest): void {

  const schoolUuid = req.body.school_uuid

  if (!schoolUuid) {
    context.res = {
      status: 400,
      body: 'school_uuid is required'
    }
    context.done()
  }
}

export default schoolPinHttpService
