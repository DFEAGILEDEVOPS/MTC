import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import config from '../../config'
import { SchoolChecksDataService } from '../util-submit-check/school-checks.data.service'
import { ReceivedCheckPayloadService } from './received-check-payload.service'
const functionName = 'util-replay-check'

const liveSchoolChecksDataService = new SchoolChecksDataService()
const receivedCheckPayloadService = new ReceivedCheckPayloadService()

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  if (!config.DevTestUtils.TestSupportApi) {
    context.log(`${functionName} exiting as config.DevTestUtils.TestSupportApi is not enabled (default behaviour)`)
    context.done()
    return
  }

  const schoolUuid = req.body?.schoolUuid
  if (schoolUuid !== undefined) {
    const liveCheckCodes = await liveSchoolChecksDataService.fetchBySchoolUuid(schoolUuid)
    const promises = liveCheckCodes.map(async record => {
      return receivedCheckPayloadService.fetch(record.checkCode)
    })
    const messages = await Promise.all(promises)
    context.bindings.submittedCheckQueue = messages
    context.done()
    return
  }

  const checkCodes = req.body?.checkCodes
  if (checkCodes === undefined || !Array.isArray(checkCodes)) {
    context.res = {
      status: 400,
      body: 'checkCodes array is required'
    }
    return
  }
  if (req.query.bad !== undefined) {
    throw new Error('invalid check functionality not yet implemented')
  }
  const messages = []
  for (let index = 0; index < checkCodes.length; index++) {
    const checkCode = checkCodes[index]
    messages.push(await receivedCheckPayloadService.fetch(checkCode))
  }
  context.bindings.submittedCheckQueue = messages
}

export default httpTrigger
