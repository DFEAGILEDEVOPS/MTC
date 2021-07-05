
import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import config from '../../config'
import { FakeSubmittedCheckMessageGeneratorService } from './fake-submitted-check-generator.service'

const fakeSubmittedCheckBuilder = new FakeSubmittedCheckMessageGeneratorService()

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
  const message = await fakeSubmittedCheckBuilder.createSubmittedCheckMessage(req.body?.checkCode)
  context.bindings.submittedCheckQueue = [message]
}

export default httpTrigger
