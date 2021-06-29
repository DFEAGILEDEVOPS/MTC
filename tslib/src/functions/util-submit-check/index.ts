
import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import * as lz from 'lz-string'
import submittedCheck from '../../schemas/submitted-check.v3'
import completeCheckPayload from '../../schemas/large-complete-check.json'
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
  message.checkCode = req.body.checkCode
  message.schoolUUID = req.body.school.uuid
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
