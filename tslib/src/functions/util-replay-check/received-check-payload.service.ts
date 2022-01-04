import { CompressionService, ICompressionService } from '../../common/compression-service'
import { validate as validateUuid } from 'uuid'
import { IReceivedCheckPayloadDataService, ReceivedCheckPayloadDataService } from './received-check-payload.data.service'
import { SubmittedCheckMessageV2 } from '../../schemas/models'

export class ReceivedCheckPayloadService {
  private readonly compressionService: ICompressionService
  private readonly dataService: IReceivedCheckPayloadDataService

  constructor (compressionService?: ICompressionService, dataService?: IReceivedCheckPayloadDataService) {
    this.compressionService = compressionService ?? new CompressionService()
    this.dataService = dataService ?? new ReceivedCheckPayloadDataService()
  }

  async fetch (checkCodes: string[]): Promise<SubmittedCheckMessageV2[]> {
    if (checkCodes.length === 0) {
      throw new Error('at least 1 checkCode is required')
    }

    for (let index = 0; index < checkCodes.length; index++) {
      const checkCode = checkCodes[index]
      if (!validateUuid(checkCode)) {
        throw new Error(`checkCode '${checkCode}' is not a valid UUID`)
      }
    }

    const archives = await this.dataService.fetchCompressedArchives(checkCodes)
    if (archives === undefined || archives.length === 0) return []
    const decompressedArchives = archives.map(a => this.compressionService.decompress(a))
    const payloads: SubmittedCheckMessageV2[] = []
    for (let index = 0; index < decompressedArchives.length; index++) {
      const da = decompressedArchives[index]
      payloads.push({
        version: 2,
        archive: da,
        checkCode: da.checkCode,
        schoolUUID: da.schoolUUID
      })
    }
    return payloads
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
