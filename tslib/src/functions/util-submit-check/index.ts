import { type AzureFunction, type Context, type HttpRequest } from '@azure/functions'
import config from '../../config'
import { FakeSubmittedCheckMessageGeneratorService } from './fake-submitted-check-generator.service'
import { SubmittedCheckVersion } from '../../schemas/SubmittedCheckVersion'
import { SchoolChecksDataService } from './school-checks.data.service'

const functionName = 'util-submit-check'

const liveSchoolChecksDataService = new SchoolChecksDataService()

export interface IUtilSubmitCheckConfig {
  schoolUuid?: string // Use schoolUuid to complete an entire school at once, OR
  checkCodes?: string[] // use `checkCodes` to have fine grain control of specific checks.
  answers?: {
    numberFromCorrectCheckForm: number // the number of answers from the correct check form
    numberFromIncorrectCheckForm: number // the number of answers from some other check form that bulk up the answer count to the expected level.
    numberOfDuplicateAnswers: number // mimic the pupil answering the question for a second time
  }
}

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  if (!config.DevTestUtils.TestSupportApi) {
    context.log(`${functionName} exiting as config.DevTestUtils.TestSupportApi is not enabled (default behaviour)`)
    return
  }

  const funcConfig: IUtilSubmitCheckConfig = {
    schoolUuid: req.body?.schoolUuid,
    checkCodes: req.body?.checkCodes,
    answers: {
      numberFromCorrectCheckForm: req.body?.answerNumberFromCorrectCheckForm,
      numberFromIncorrectCheckForm: req.body?.answerNumberFromIncorrectCheckForm,
      numberOfDuplicateAnswers: req.body?.answerNumberOfDuplicates
    }
  }

  const messageVersion: string = req.body?.messageVersion ?? SubmittedCheckVersion.V3
  context.log(`req.body.messageVersion - type:${typeof req.body?.messageVersion} value:${req.body?.messageVersion}`)
  context.log(`messageVersion - type:${typeof messageVersion} value:${messageVersion}`)
  context.log(`SubmittedCheckVersion.V3 - type:${typeof SubmittedCheckVersion.V3}
    value:${SubmittedCheckVersion.V3} toString:${SubmittedCheckVersion.V3.toString()}`)

  if (messageVersion !== SubmittedCheckVersion.V2.toString() &&
    messageVersion !== SubmittedCheckVersion.V3.toString()) {
    context.res = {
      status: 400,
      body: 'unknown messageVersion specified'
    }
    return
  }

  context.log(`${functionName} config parsed as: ${JSON.stringify(funcConfig)})`)
  const fakeSubmittedCheckBuilder = new FakeSubmittedCheckMessageGeneratorService()
  fakeSubmittedCheckBuilder.setLogger(context.log)
  fakeSubmittedCheckBuilder.setConfig(funcConfig)
  if (funcConfig.schoolUuid !== undefined) {
    const liveCheckCodes = await liveSchoolChecksDataService.fetchBySchoolUuid(funcConfig.schoolUuid)
    const promises = liveCheckCodes.map(async record => {
      if (messageVersion === SubmittedCheckVersion.V2.toString()) {
        return fakeSubmittedCheckBuilder.createV2Message(record.checkCode)
      } else {
        return fakeSubmittedCheckBuilder.createV3Message(record.checkCode)
      }
    })
    const messages = await Promise.all(promises)
    context.bindings.submittedCheckQueue = messages
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
    if (messageVersion === SubmittedCheckVersion.V2.toString()) {
      messages.push(await fakeSubmittedCheckBuilder.createV2Message(checkCode))
    } else {
      messages.push(await fakeSubmittedCheckBuilder.createV3Message(checkCode))
    }
  }
  context.bindings.submittedCheckQueue = messages
}

export default httpTrigger
