import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import config from '../../config'
import { FakeSubmittedCheckMessageGeneratorService } from './fake-submitted-check-generator.service'
import { SchoolChecksDataService } from './school-checks.data.service'

const functionName = 'util-submit-check'

const liveSchoolChecksDataService = new SchoolChecksDataService()

export interface IUtilSubmitCheckConfig {
  schoolUuid?: string // Use schoolUuid to complete an entire school at once, OR
  checkCodes?: string[] // use `checkCdodes` to have fine grain control of specific checks.
  answers?: {
    numberFromCorrectCheckForm: number // the number of answers from the correct check form
    numberFromIncorrectCheckForm: number // the number of answers from some other check form that bulk up the answer count to the expected level.
  }
}

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  if (!config.DevTestUtils.TestSupportApi) {
    context.log(`${functionName} exiting as config.DevTestUtils.TestSupportApi is not enabled (default behaviour)`)
    context.done()
    return
  }

  const funcConfig: IUtilSubmitCheckConfig = {
    schoolUuid: req.body?.schoolUuid,
    checkCodes: req.body?.checkCodes,
    answers: {
      numberFromCorrectCheckForm: req.body?.answerNumberFromCorrectCheckForm,
      numberFromIncorrectCheckForm: req.body?.answerNumberFromIncorrectCheckForm
    }
  }
  context.log(`${functionName} config parsed as: ${JSON.stringify(funcConfig)})`)
  const fakeSubmittedCheckBuilder = new FakeSubmittedCheckMessageGeneratorService()
  fakeSubmittedCheckBuilder.setConfig(funcConfig)
  if (funcConfig.schoolUuid !== undefined) {
    const liveCheckCodes = await liveSchoolChecksDataService.fetchBySchoolUuid(funcConfig.schoolUuid)
    const promises = liveCheckCodes.map(async record => {
      return fakeSubmittedCheckBuilder.createSubmittedCheckMessage(record.checkCode)
    })
    const messages = await Promise.all(promises)
    context.bindings.submittedCheckQueue = messages
    context.done()
    return
  }

  if (funcConfig.checkCodes === undefined || !Array.isArray(funcConfig.checkCodes)) {
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
  for (let index = 0; index < funcConfig.checkCodes.length; index++) {
    const checkCode = funcConfig.checkCodes[index]
    messages.push(await fakeSubmittedCheckBuilder.createSubmittedCheckMessage(checkCode))
  }
  context.bindings.submittedCheckQueue = messages
}

export default httpTrigger
