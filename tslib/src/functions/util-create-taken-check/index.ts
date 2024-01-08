import { type Context } from '@azure/functions'
import { FakeSubmittedCheckMessageGeneratorService } from '../util-submit-check/fake-submitted-check-generator.service'

const checkGenerator = new FakeSubmittedCheckMessageGeneratorService()

export default async function (context: Context): Promise<void> {
  const requestBody = context?.req?.body
  if (requestBody === undefined || requestBody.checkCode === undefined) {
    context.res = {
      status: 400,
      body: 'checkCode is required'
    }
    return
  }

  const outputPayload = await checkGenerator.createV3Message(requestBody.checkCode)

  context.res = {
    status: 200,
    body: outputPayload
  }
}
