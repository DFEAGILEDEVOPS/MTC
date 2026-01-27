import { type IPsReportDataService, PsReportDataService } from './ps-report.data.service'
import { type Pupil, type PupilResult, type School } from './pupil-data.models'
import { type ILogger } from '../../common/logger'
import type { PsReportSchoolFanOutMessage, PsReportBatchMessage } from '../common/ps-report-service-bus-messages'
import config from '../../config'
import { ReportLine } from './report-line.class'
import { type IPsychometricReportLine } from './transformer-models'

const logName = 'ps-report-2-pupil-data: PsReportService'

export interface IPsReportServiceOutput {
  psReportExportOutput: PsReportBatchMessage[]
  failedPupilCount: number
  successfulPupilCount: number
}

interface PupilProcessingResult {
  success: boolean
  data?: IPsychometricReportLine
  error?: string
  pupilSlug: string
}

export class PsReportService {
  private readonly dataService: IPsReportDataService
  private readonly logger: ILogger
  private readonly batchSize: number

  constructor (logger: ILogger, dataService?: IPsReportDataService) {
    this.logger = logger
    this.dataService = dataService ?? new PsReportDataService(this.logger)
    this.batchSize = config.PsReport.PupilProcessingBatchSize
    logger.info(`${logName}: PsReportService initialized with batch size ${this.batchSize}`)
  }

  /**
   * Process pupils in batches to improve performance while limiting concurrent database connections
   * Fetches all data for a batch in bulk before processing individual pupils
   */
  private async processPupilsInBatches (pupils: readonly Pupil[], school: School, schoolUuid: string): Promise<PupilProcessingResult[]> {
    const results: PupilProcessingResult[] = []

    for (let i = 0; i < pupils.length; i += this.batchSize) {
      const batch = pupils.slice(i, i + this.batchSize)
      const batchNumber = Math.floor(i / this.batchSize) + 1
      const totalBatches = Math.ceil(pupils.length / this.batchSize)

      if (config.Logging.DebugVerbosity > 0) {
        this.logger.info(`${logName}: Processing batch ${batchNumber}/${totalBatches} (${batch.length} pupils) for school ${schoolUuid}`)
      }

      // Fetch all data for this batch in bulk (3-4 queries instead of 7+ per pupil)
      const bulkCheckData = await this.dataService.getBulkCheckData(batch)

      // Process all pupils in this batch concurrently using pre-fetched data
      const batchPromises = batch.map(pupil => this.processPupilFromBulkData(pupil, school, schoolUuid, bulkCheckData))
      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
    }

    return results
  }

  /**
   * Process a single pupil using pre-fetched bulk data
   * This is much faster as all database queries are already done
   */
  private async processPupilFromBulkData (
    pupil: Pupil,
    school: School,
    schoolUuid: string,
    bulkCheckData: Map<number, any>
  ): Promise<PupilProcessingResult> {
    try {
      const checkData = bulkCheckData.get(pupil.id) || {
        check: null,
        config: null,
        form: null,
        answers: null,
        device: null,
        events: null,
        inputAssistant: null
      }

      const pupilResult: PupilResult = {
        answers: checkData.answers,
        check: checkData.check,
        checkConfig: checkData.config,
        checkForm: checkData.form,
        device: checkData.device,
        events: checkData.events,
        pupil,
        school,
        inputAssistant: checkData.inputAssistant
      }

      // Transform pupil data into report format
      const reportLine = new ReportLine(
        pupilResult.answers,
        pupilResult.check,
        pupilResult.checkConfig,
        pupilResult.checkForm,
        pupilResult.device,
        pupilResult.events,
        pupilResult.pupil,
        pupilResult.school,
        pupilResult.inputAssistant
      )
      const outputData = reportLine.transform()

      return {
        success: true,
        data: outputData,
        pupilSlug: pupil.slug
      }
    } catch (error: any) {
      const errorMessage = error?.message ?? 'Unknown error'
      this.logger.error(`${logName}: ERROR: Failed to process pupil ${pupil.slug} in school ${schoolUuid}: ${errorMessage}`)
      return {
        success: false,
        error: errorMessage,
        pupilSlug: pupil.slug
      }
    }
  }

  async process (incomingMessage: PsReportSchoolFanOutMessage): Promise<IPsReportServiceOutput> {
    if (config.Logging.DebugVerbosity > 1) {
      this.logger.trace(`${logName}.process() called with ${JSON.stringify(incomingMessage)}`)
    }

    let pupils: readonly Pupil[]
    let school: School | undefined
    /**
     *  This function is triggered by an incoming service bus message.
     *
     */

    try {
      // Get pupil data for all pupils in a single school identified by the UUID in the incoming message.
      pupils = await this.dataService.getPupils(incomingMessage.uuid)
    } catch (error) {
      this.logger.error(`${logName}: ERROR - unable to fetch pupils for school ${incomingMessage.uuid}`)
      throw error
    }

    if (pupils.length === 0) {
      this.logger.info(`${logName}: No pupils found for school ${incomingMessage.uuid}`)
      return {
        psReportExportOutput: [],
        failedPupilCount: 0,
        successfulPupilCount: 0
      }
    }

    // Fetch school data once for all pupils
    try {
      school = await this.dataService.getSchool(pupils[0].schoolId)
    } catch (error) {
      this.logger.error(`${logName}: ERROR - unable to fetch school data for school ID ${pupils[0].schoolId}`)
      throw error
    }

    this.logger.info(`${logName}: Processing ${pupils.length} pupils for school ${incomingMessage.name} (${incomingMessage.uuid}) in batches of ${this.batchSize}`)
    const startTime = Date.now()

    // Process pupils in parallel batches
    const results = await this.processPupilsInBatches(pupils, school, incomingMessage.uuid)

    // Collect successful results and count failures
    const successfulResults = results.filter((r): r is typeof results[number] & { data: NonNullable<typeof results[number]['data']> } => r.success && r.data !== undefined)
    const failedResults = results.filter(r => !r.success)

    // Batch the output results to reduce Service Bus message count, respecting 1MB size limit
    // Azure Service Bus max message size is 1MB (1048576 bytes). We use a conservative limit of 900KB
    // to account for AMQP encoding overhead and message metadata
    const reportLines = successfulResults.map(r => r.data)
    const MAX_SERVICE_BUS_MESSAGE_SIZE = 900000 // Conservative 900KB limit
    const batchedMessages: PsReportBatchMessage[] = []

    let currentBatch: IPsychometricReportLine[] = []
    let currentBatchSize = 0

    for (const reportLine of reportLines) {
      // Estimate the size of this report line when serialized
      const lineJson = JSON.stringify(reportLine)
      const lineSize = Buffer.byteLength(lineJson, 'utf8')

      // Check if adding this line would exceed the size limit
      // Account for batch message wrapper (~500 bytes for metadata)
      const messageWrapperSize = 500
      const estimatedNewSize = currentBatchSize + lineSize + messageWrapperSize

      if (estimatedNewSize > MAX_SERVICE_BUS_MESSAGE_SIZE && currentBatch.length > 0) {
        // Current batch is at capacity, save it and start a new one
        batchedMessages.push({
          jobUuid: incomingMessage.jobUuid,
          batch: currentBatch,
          batchNumber: batchedMessages.length + 1,
          totalBatches: -1, // Will update after all batches are created
          schoolUuid: incomingMessage.uuid,
          schoolName: incomingMessage.name
        })
        currentBatch = []
        currentBatchSize = 0
      }

      currentBatch.push(reportLine)
      currentBatchSize += lineSize
    }

    // Add the final batch if it has any data
    if (currentBatch.length > 0) {
      batchedMessages.push({
        jobUuid: incomingMessage.jobUuid,
        batch: currentBatch,
        batchNumber: batchedMessages.length + 1,
        totalBatches: -1, // Will update after all batches are created
        schoolUuid: incomingMessage.uuid,
        schoolName: incomingMessage.name
      })
    }

    // Update totalBatches for all messages
    const totalBatches = batchedMessages.length
    batchedMessages.forEach(msg => {
      msg.totalBatches = totalBatches
    })

    const output: IPsReportServiceOutput = {
      psReportExportOutput: batchedMessages,
      successfulPupilCount: successfulResults.length,
      failedPupilCount: failedResults.length
    }

    const endTime = Date.now()
    const durationMs = endTime - startTime
    const avgTimePerPupil = pupils.length > 0 ? (durationMs / pupils.length).toFixed(2) : '0'

    this.logger.info(`${logName}: School ${incomingMessage.name} processing complete: ${successfulResults.length} successful, ${failedResults.length} failed out of ${pupils.length} pupils (${durationMs}ms total, ${avgTimePerPupil}ms avg per pupil). Batched into ${batchedMessages.length} size-limited messages`)

    if (failedResults.length > 0) {
      const failureRate = ((failedResults.length / pupils.length) * 100).toFixed(2)
      this.logger.warn(`${logName}: ${failedResults.length} pupils failed for school ${incomingMessage.uuid} (${failureRate}% failure rate)`)

      // Log first few failures for debugging
      const failuresToLog = failedResults.slice(0, 5)
      failuresToLog.forEach(failure => {
        this.logger.warn(`${logName}: Failed pupil ${failure.pupilSlug}: ${failure.error}`)
      })

      if (failedResults.length > 5) {
        this.logger.warn(`${logName}: ... and ${failedResults.length - 5} more failures`)
      }
    }

    return output
  }
}
