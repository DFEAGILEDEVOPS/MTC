
import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import * as lz from 'lz-string'
import uuid from 'uuid/v4'
import submittedCheck from '../../schemas/submitted-check.v3'
import completeCheckPayload from '../../schemas/complete-check-payload'

const httpTrigger: AzureFunction = function (context: Context, req: HttpRequest): void {
  const message = JSON.parse(JSON.stringify(submittedCheck))
  message.checkCode = req.query['checkCode']
  message.schoolUUID = uuid()
  // enable to create an invalid check
  // delete completeCheckPayload.answers
  const archive = lz.compressToUTF16(JSON.stringify(completeCheckPayload))
  message.archive = archive
  context.bindings.submittedCheckQueue = [ message ]
  context.done()
}

export default httpTrigger
