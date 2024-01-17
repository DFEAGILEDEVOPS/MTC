import { type Context } from '@azure/functions'
import { FakeCompletedCheckMessageGeneratorService } from '../util-submit-check/fake-submitted-check-generator.service'

const checkGenerator = new FakeCompletedCheckMessageGeneratorService()

export default async function (context: Context): Promise<void> {
  const requestBody = context?.req?.body
  if (requestBody === undefined || requestBody.checkCode === undefined) {
    context.res = {
      status: 400,
      body: 'checkCode is required'
    }
    return
  }

  try {
    const outputPayload = await checkGenerator.createV3Message(requestBody.checkCode)
    context.res = {
      status: 200,
      body: outputPayload
    }
  } catch (error) {
    let msg = 'unknown error'
    if (error instanceof Error) {
      msg = error.message
    }
    context.res = {
      status: 500,
      body: `An error occured: ${msg}`
    }
  }
}
