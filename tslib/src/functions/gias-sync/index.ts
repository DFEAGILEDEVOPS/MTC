import { AzureFunction, Context } from '@azure/functions'
import { performance } from 'perf_hooks'
const functionName = 'gias-sync'
import { GiasService } from './gias.service'
import config from '../../config'

const timerTrigger: AzureFunction = async function (context: Context): Promise<void> {
  const start = performance.now()

  const giasService = new GiasService()
  const extractXml = await giasService.GetExtract(config.Gias.ExtractId)
  context.bindings.giasExtractFile = extractXml

  const end = performance.now()
  const durationInMilliseconds = end - start
  const timeStamp = new Date().toISOString()
  context.log(`${functionName}: ${timeStamp} run complete: ${durationInMilliseconds} ms`)
}

export default timerTrigger
