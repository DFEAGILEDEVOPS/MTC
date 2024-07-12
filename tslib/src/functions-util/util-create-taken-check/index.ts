import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import { FakeCompletedCheckMessageGeneratorService } from '../util-submit-check/fake-submitted-check-generator.service'
import config from '../../config'

const checkGenerator = new FakeCompletedCheckMessageGeneratorService()

app.http('util-create-taken-check', {
  methods: ['POST'],
  authLevel: 'function', // TODO this was anonymous in v3 - why? used in browser testing?
  handler: utilCreateTakenCheck
})

export async function utilCreateTakenCheck (request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  if (!config.DevTestUtils.TestSupportApi) {
    context.log('exiting as not enabled (default behaviour)')
    return {
      status: 409,
      body: 'feature unavailable'
    }
  }
  const rawJsonBody = await request.json()
  const requestBody = JSON.parse(rawJsonBody as string)
  if (requestBody === null || requestBody?.checkCode === undefined) {
    return {
      status: 400,
      body: 'checkCode is required'
    }
  }

  try {
    const outputPayload = await checkGenerator.createV3Message(requestBody.checkCode)
    return {
      status: 200,
      jsonBody: outputPayload
    }
  } catch (error) {
    let msg = 'unknown error'
    if (error instanceof Error) {
      msg = error.message
    }
    return {
      status: 500,
      body: `An error occured: ${msg}`
    }
  }
}
