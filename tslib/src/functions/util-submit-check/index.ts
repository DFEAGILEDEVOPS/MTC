
import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import config from '../../config'
import { FakeSubmittedCheckMessageGeneratorService } from './fake-submitted-check-generator.service'
import { SchoolChecksDataService } from './school-checks.data.service'

const fakeSubmittedCheckBuilder = new FakeSubmittedCheckMessageGeneratorService()
const liveSchoolChecksDataService = new SchoolChecksDataService()

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  if (!config.DevTestUtils.TestSupportApi) {
    context.log('exiting as config.DevTestUtils.TestSupportApi is not enabled (default behaviour)')
    context.done()
    return
  }

  const schoolUuid = req.body?.schoolUuid
  if (schoolUuid !== undefined) {
    const liveCheckCodes = await liveSchoolChecksDataService.fetchBySchoolUuid(schoolUuid)
    console.dir(liveCheckCodes)
    const promises = liveCheckCodes.map(record => {
      return fakeSubmittedCheckBuilder.createSubmittedCheckMessage(record.checkCode)
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
    messages.push(await fakeSubmittedCheckBuilder.createSubmittedCheckMessage(checkCode))
  }
  context.bindings.submittedCheckQueue = messages
}

export default httpTrigger
