
import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import { SchoolPinReplenishmnentService } from '../school-pin-generator/school-pin-replenishment.service'

const schoolPinHttpService: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {

  const schoolUuid = req.body.school_uuid

  if (!schoolUuid) {
    context.res = {
      status: 400,
      body: 'school_uuid is required'
    }
    context.done()
  }
  const schoolPinReplenishmentService = new SchoolPinReplenishmnentService()
  await schoolPinReplenishmentService.process(context.log, schoolUuid)
  context.done()
}

export default schoolPinHttpService
