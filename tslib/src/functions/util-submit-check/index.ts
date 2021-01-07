
import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import * as lz from 'lz-string'
import { v4 as uuidv4 } from 'uuid'
import submittedCheck from '../../schemas/submitted-check.v3'
import completeCheckPayload from '../../schemas/complete-check-payload'
import config from '../../config'

const httpTrigger: AzureFunction = function (context: Context, req: HttpRequest): void {
  if (!config.DevTestUtils.TestSupportApi) {
    context.log('exiting as not enabled (default behaviour)')
    context.done()
    return
  }
  // TODO add support for live check toggle via query string?
  const message = JSON.parse(JSON.stringify(submittedCheck))
  const samplePayload = JSON.parse(JSON.stringify(completeCheckPayload))
  message.checkCode = req.query.checkCode ?? uuidv4()
  message.schoolUUID = uuidv4()
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
