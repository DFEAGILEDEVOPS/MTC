import { AzureFunction, Context, HttpRequest } from '@azure/functions'
import moment from 'moment'
import { performance } from 'perf_hooks'
import config from '../../config'
import { IPsReportLogEntry, PsReportSource } from '../../schemas/ps-report-log-entry'
import * as uuid from 'uuid'

const functionName = 'util-gen-ps-report-logs'

function finish (start: number, context: Context): void {
  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

const funcImplementation: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
  if (!config.DevTestUtils.TestSupportApi) {
    context.log('exiting as not enabled (default behaviour)')
    context.done()
    return
  }
  const start = performance.now()
  let messageCount = 100
  if (req.query.messageCount !== undefined) {
    messageCount = parseInt(req.query.messageCount, 10)
  }

  const messages: IPsReportLogEntry[] = []
  for (let index = 0; index < messageCount; index++) {
    const batch: IPsReportLogEntry[] = [
      {
        generatedAt: moment(),
        message: `${uuid.v4()} this is a test message`,
        source: PsReportSource.PupilGenerator
      },
      {
        generatedAt: moment(),
        message: `${uuid.v4()} this is a test message`,
        source: PsReportSource.SchoolGenerator
      },
      {
        generatedAt: moment(),
        message: `${uuid.v4()} this is a test message`,
        source: PsReportSource.Transformer
      },
      {
        generatedAt: moment(),
        message: `${uuid.v4()} this is a test message`,
        source: PsReportSource.Writer
      }
    ]
    messages.push(...batch)
  }
  context.bindings.psReportLogQueue = messages

  finish(start, context)
}

export default funcImplementation
