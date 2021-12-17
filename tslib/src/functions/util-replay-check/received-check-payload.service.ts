import { CompressionService, ICompressionService } from '../../common/compression-service'
import { validate as validateUuid } from 'uuid'
import { IReceivedCheckPayloadDataService, ReceivedCheckPayloadDataService } from './received-check-payload.data.service'
import { SubmittedCheckMessageV2 } from '../../schemas/models'

export class ReceivedCheckPayloadService {
  private readonly compressionService: ICompressionService
  private readonly dataService: IReceivedCheckPayloadDataService

  constructor(compressionService?: ICompressionService, dataService?: IReceivedCheckPayloadDataService) {
    this.compressionService = compressionService ?? new CompressionService()
    this.dataService = dataService ?? new ReceivedCheckPayloadDataService()
  }

  async fetch (checkCode: string): Promise<SubmittedCheckMessageV2 | undefined> {
    if (checkCode === '') {
      throw new Error('checkCode is required')
    }
    if (!validateUuid(checkCode)) {
      throw new Error('checkCode is not a valid UUID')
    }
    const archive = await this.dataService.fetchCompressedArchive(checkCode)
    if (archive === undefined) return undefined
    const decompressed = this.compressionService.decompress(archive)
    return {
      version: 2,
      archive: archive,
      checkCode: decompressed.checkCode,
      schoolUUID: decompressed.schoolUUID
    }
  }

  async fetchBySchool (schoolUuid: string): Promise<SubmittedCheckMessageV2[]> {
    if (schoolUuid === '') {
      throw new Error('schoolUuid is required')
    }
    if (!validateUuid(schoolUuid)) {
      throw new Error('schoolUuid is not a valid UUID')
    }
    const response = await this.dataService.fetchArchivesForSchool(schoolUuid)
    if (response.length === 0) return []
    const toReturn: SubmittedCheckMessageV2[] = response.map(item => {
      return {
        version: 2,
        checkCode: item.checkCode,
        schoolUUID: schoolUuid,
        archive: item.archive
      }
    })
    return toReturn
  }
}
