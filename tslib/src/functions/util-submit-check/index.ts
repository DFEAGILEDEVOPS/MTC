
import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import * as lz from 'lz-string'
import uuid from 'uuid/v4'
import submittedCheck from '../../schemas/submitted-check.v3'
import completeCheckPayload from '../../schemas/complete-check-payload'
import config from '../../config'

const httpTrigger: AzureFunction = function (context: Context, req: HttpRequest): void {
  if (!config.DevTestUtils.SubmitCheckForLoadTestFunctionEnabled) {
    context.log('exiting as not enabled (default behaviour)')
    context.done()
    return
  }
  // TODO add support for live check toggle via query string?
  const message = JSON.parse(JSON.stringify(submittedCheck))
  const samplePayload = JSON.parse(JSON.stringify(completeCheckPayload))
  message.checkCode = req.query.checkCode ?? uuid()
  message.schoolUUID = uuid()
  // create an invalid check
  if (req.query.bad !== undefined) {
    context.log('creating invalid check...')
    delete samplePayload.answers
  }
  const archive = lz.compressToUTF16(JSON.stringify(samplePayload))
  message.archive = archive
  context.bindings.submittedCheckQueue = [message]
  context.done()
}

export default httpTrigger
