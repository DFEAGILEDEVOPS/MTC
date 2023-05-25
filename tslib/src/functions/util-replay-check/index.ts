import { type AzureFunction, type Context, type HttpRequest } from '@azure/functions'
import config from '../../config'
import { ReceivedCheckPayloadService } from './received-check-payload.service'
const functionName = 'util-replay-check'

const receivedCheckPayloadService = new ReceivedCheckPayloadService()

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  if (!config.DevTestUtils.TestSupportApi) {
    context.log(`${functionName} exiting as config.DevTestUtils.TestSupportApi is not enabled (default behaviour)`)
    context.done()
    return
  }

  const schoolUuid = req.body?.schoolUuid
  if (schoolUuid !== undefined) {
    const messages = await receivedCheckPayloadService.fetchBySchool(schoolUuid)
    context.log(`found ${messages.length} checks to replay for school.uuid:${schoolUuid}`)
    context.bindings.submittedCheckQueue = messages
    context.done()
    return
  }

  const checkCodes: string[] = req.body?.checkCodes
  if (checkCodes === undefined || !Array.isArray(checkCodes)) {
    context.res = {
      status: 400,
      body: 'checkCodes array is required'
    }
    return
  }
  //  console.dir(checkCodes)
  const messages = await receivedCheckPayloadService.fetch(checkCodes)
  // console.dir(messages)
  context.bindings.submittedCheckQueue = messages
}

export default httpTrigger
