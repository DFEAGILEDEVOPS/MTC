import { type AzureFunction, type Context, type HttpRequest } from '@azure/functions'
import moment from 'moment'
import { performance } from 'perf_hooks'
import config from '../../config'
import { type IPsReportLogEntry, PsReportSource } from '../../functions-ps-report/common/ps-report-log-entry'
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
  let messageCount = 10000
  if (req.query.messageCount !== undefined) {
    messageCount = parseInt(req.query.messageCount, 10)
  }
  context.log(`attempting to add ${messageCount} messages onto the ps-report-log service bus queue...`)
  const messages: IPsReportLogEntry[] = []
  for (let index = 0; index < messageCount; index++) {
    const batch: IPsReportLogEntry[] = [
      {
        generatedAt: moment(),
        message: `${uuid.v4()} this is a test message`,
        source: PsReportSource.PupilGenerator,
        level: 'error'
      },
      {
        generatedAt: moment(),
        message: `${uuid.v4()} this is a test message`,
        source: PsReportSource.SchoolGenerator,
        level: 'error'
      },
      {
        generatedAt: moment(),
        message: `${uuid.v4()} this is a test message`,
        source: PsReportSource.Transformer,
        level: 'info'
      },
      {
        generatedAt: moment(),
        message: `${uuid.v4()} this is a test message`,
        source: PsReportSource.Writer,
        level: 'verbose'
      }
    ]
    messages.push(...batch)
  }
  context.bindings.psReportLogQueue = messages
  context.log(`finished adding ${messageCount} messages onto the ps-report-log service bus queue...`)
  finish(start, context)
  context.res = {
    status: 204,
    body: ''
  }
  context.done()
}

export default funcImplementation
