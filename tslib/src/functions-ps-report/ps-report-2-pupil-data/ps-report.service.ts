import { type IPsReportDataService, PsReportDataService } from './ps-report.data.service'
import { type Pupil, type PupilResult, type School } from './pupil-data.models'
import { type ILogger } from '../../common/logger'
import type { PsReportSchoolFanOutMessage } from '../common/ps-report-service-bus-messages'
import config from '../../config'
import { ReportLine } from './report-line.class'
import { type IPsychometricReportLine } from './transformer-models'

const logName = 'ps-report-2-pupil-data: PsReportService'

export interface IPsReportServiceOutput {
  psReportExportOutput: IPsychometricReportLine[]
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
   * Process a single pupil and return the result with error handling
   */
  private async processPupil (pupil: Pupil, school: School, schoolUuid: string): Promise<PupilProcessingResult> {
    try {
      const result: PupilResult = await this.dataService.getPupilData(pupil, school)
      const pupilResult: PupilResult = {
        answers: result.answers,
        check: result.check,
        checkConfig: result.checkConfig,
        checkForm: result.checkForm,
        device: result.device,
        events: result.events,
        pupil: result.pupil,
        school: result.school,
        inputAssistant: result.inputAssistant
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

  /**
   * Process pupils in batches to improve performance while limiting concurrent database connections
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

      // Process all pupils in this batch concurrently
      const batchPromises = batch.map(pupil => this.processPupil(pupil, school, schoolUuid))
      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults)
    }

    return results
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

    const output: IPsReportServiceOutput = {
      psReportExportOutput: successfulResults.map(r => r.data),
      successfulPupilCount: successfulResults.length,
      failedPupilCount: failedResults.length
    }

    const endTime = Date.now()
    const durationMs = endTime - startTime
    const avgTimePerPupil = pupils.length > 0 ? (durationMs / pupils.length).toFixed(2) : '0'

    this.logger.info(`${logName}: School ${incomingMessage.name} processing complete: ${successfulResults.length} successful, ${failedResults.length} failed out of ${pupils.length} pupils (${durationMs}ms total, ${avgTimePerPupil}ms avg per pupil)`)

    if (failedResults.length > 0) {
      const failureRate = ((failedResults.length / pupils.length) * 100).toFixed(2)
      this.logger.warn(`${logName}: ${failedResults.length} pupils failed for school ${incomingMessage.uuid} (${failureRate}% failure rate)`)

      // Log first few failures for debugging
      const failuresToLog = failedResults.slice(0, 5)
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions,@typescript-eslint/no-non-null-assertion
      failuresToLog.forEach(failure => {successfulResults.map(r => r.data!),
        this.logger.warn(`${logName}: Failed pupil ${failure.pupilSlug}: ${failure.error}`)
      })

      if (failedResults.length > 5) {
        this.logger.warn(`${logName}: ... and ${failedResults.length - 5} more failures`)
      }
    }

    return output
  }
}
