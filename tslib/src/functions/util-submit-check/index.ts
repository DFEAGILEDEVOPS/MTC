
import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import config from '../../config'
import { FakeSubmittedCheckMessageBuilderService } from './fake-submitted-check-builder.service'

const fakeSubmittedCheckBuilder = new FakeSubmittedCheckMessageBuilderService()

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  if (!config.DevTestUtils.TestSupportApi) {
    context.log('exiting as config.DevTestUtils.TestSupportApi is not enabled (default behaviour)')
    context.done()
    return
  }
  const checkCode = req.body?.checkCode
  if (checkCode === undefined) {
    context.res = {
      status: 400,
      body: 'checkCode is required'
    }
    return
  }
  if (req.query.bad !== undefined) {
    throw new Error('invalid check functionality not yet implemented')
  }
  const message = await fakeSubmittedCheckBuilder.createSubmittedCheckMessage(req.body?.checkCode, {
    answerCount: 25,
    correctAnswerCount: 25
  })
  console.dir(message)
  context.bindings.submittedCheckQueue = [message]
}

export default httpTrigger
