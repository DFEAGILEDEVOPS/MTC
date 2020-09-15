import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
const functionName = 'gias-sync'
import { GiasService } from './gias.service'
import config from '../../config'
import { GiasExtractParser } from './gias-extract-parser'
import { GiasBulkImport } from './gias-bulk-import.service'

const timerTrigger: AzureFunction = async function (context: Context, timer: any): Promise<void> {
  const start = performance.now()

  const giasService = new GiasService()
  const extractXml = await giasService.GetExtract(config.Gias.ExtractId)
  context.bindings.giasExtractFile = extractXml

  const xmlParser = new GiasExtractParser()
  const schools = xmlParser.parse(extractXml)
  const bulkImportService = new GiasBulkImport()
  await bulkImportService.importExtract(schools)

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

export default timerTrigger
