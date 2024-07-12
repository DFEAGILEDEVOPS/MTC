import { app, output, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import config from '../../config'
import { FakeCompletedCheckMessageGeneratorService } from './fake-submitted-check-generator.service'
import { SubmittedCheckVersion } from '../../schemas/SubmittedCheckVersion'
import { SchoolChecksDataService } from './school-checks.data.service'

const functionName = 'util-submit-check'

const outputSubmittedCheckStorageQueue = output.storageQueue({
  connection: 'AZURE_STORAGE_CONNECTION_STRING',
  queueName: 'check-submitted'
})

const outputCheckSubmissionServiceBusQueue = output.serviceBusQueue({
  connection: 'AZURE_SERVICE_BUS_CONNECTION_STRING',
  queueName: 'check-submission'
})

app.http(functionName, {
  methods: ['POST'],
  authLevel: 'function',
  handler: utilSubmitCheck,
  extraOutputs: [outputSubmittedCheckStorageQueue, outputCheckSubmissionServiceBusQueue]
})

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

export async function utilSubmitCheck (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  if (!config.DevTestUtils.TestSupportApi) {
    context.log(`${functionName} exiting as config.DevTestUtils.TestSupportApi is not enabled (default behaviour)`)
    return {
      status: 409,
      body: 'feature unavailable'
    }
  }

  const rawJsonBody = await req.json()
  const reqBody = JSON.parse(rawJsonBody as string)
  const funcConfig: IUtilSubmitCheckConfig = {
    schoolUuid: reqBody.schoolUuid,
    checkCodes: reqBody.checkCodes,
    answers: {
      numberFromCorrectCheckForm: reqBody.answerNumberFromCorrectCheckForm,
      numberFromIncorrectCheckForm: reqBody.answerNumberFromIncorrectCheckForm,
      numberOfDuplicateAnswers: reqBody.answerNumberOfDuplicates
    }
  }

  const messageVersion: string = reqBody.messageVersion ?? SubmittedCheckVersion.V3

  if (messageVersion.toString() !== SubmittedCheckVersion.V2.toString() &&
    messageVersion.toString() !== SubmittedCheckVersion.V3.toString()) {
    return {
      status: 400,
      body: 'unknown messageVersion specified'
    }
  }

  context.log(`${functionName} config parsed as: ${JSON.stringify(funcConfig)})`)
  const fakeSubmittedCheckBuilder = new FakeCompletedCheckMessageGeneratorService()
  fakeSubmittedCheckBuilder.setLogger(context)
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
    context.extraOutputs.set(outputSubmittedCheckStorageQueue, messages)
    return {
      status: 200
    }
  }

  if (funcConfig.checkCodes === undefined || !Array.isArray(funcConfig.checkCodes)) {
    return {
      status: 400,
      body: 'checkCodes array is required'
    }
  }
  if (req.query.get('bad') !== undefined) {
    throw new Error('invalid check functionality not yet implemented')
  }
  const messages = []
  for (let index = 0; index < funcConfig.checkCodes.length; index++) {
    const checkCode = funcConfig.checkCodes[index]
    if (messageVersion === SubmittedCheckVersion.V2.toString()) {
      messages.push(await fakeSubmittedCheckBuilder.createV2Message(checkCode))
      context.extraOutputs.set(outputSubmittedCheckStorageQueue, messages)
    } else {
      messages.push(await fakeSubmittedCheckBuilder.createV3Message(checkCode))
      context.extraOutputs.set(outputCheckSubmissionServiceBusQueue, messages)
    }
  }
  return {
    status: 200
  }
}
