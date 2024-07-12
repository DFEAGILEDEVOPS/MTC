import { app, type HttpRequest, type HttpResponseInit, type InvocationContext } from '@azure/functions'
import { performance } from 'perf_hooks'
import config from '../../config'
import { TableService } from '../../azure/table-service'
import { CompressionService } from '../../common/compression-service'
import { type ReceivedCheckTableEntity } from '../../schemas/models'

const functionName = 'util-received-check-reader'

app.http(functionName, {
  methods: ['GET'],
  authLevel: 'function',
  handler: utilReceivedCheckViewer
})

function finish (start: number, context: InvocationContext): void {
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

export async function utilReceivedCheckViewer (req: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  if (!config.DevTestUtils.TestSupportApi) {
    context.log('exiting as not enabled (default behaviour)')
    return {
      status: 409,
      body: 'feature unavailable'
    }
  }
  const start = performance.now()
  if (req.query.get('checkCode') === undefined || req.query.get('schoolUUID') === undefined) {
    return {
      status: 400,
      body: 'checkCode and schoolUUID properties are required'
    }
  }
  const tableService = new TableService()
  const schoolUUID = req.query.get('schoolUUID') ?? ''
  const checkCode = req.query.get('checkCode') ?? ''
  const receivedCheck = await tableService.getEntity<ReceivedCheckTableEntity>('receivedCheck', schoolUUID, checkCode)
  const archive = receivedCheck.archive ?? ''
  const compressionService = new CompressionService()
  const decompressed = compressionService.decompressFromUTF16(archive)
  finish(start, context)
  return {
    jsonBody: decompressed,
    headers: {
      'Content-Type': 'application/json'
    }
  }
}
